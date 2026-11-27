import Stripe from 'stripe';
import Logger from 'bunyan';
import mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import Tenant from '@modules/server.common/entities/Tenant';
import type {
	BillingInterval,
	ITenantBilling,
	TenantPlan,
} from '@modules/server.common/interfaces/ITenant';
import { createEverLogger } from '../../helpers/Log';
import { env } from '../../env';
import { TenantsService } from '../tenants/TenantsService';
import { AdminsService } from '../admins';
import { TenantContext } from '../../tenant/tenant-context';
import { tenantDirectory } from '../../tenant/tenant-directory';
import {
	BILLING_INTERVALS,
	isSeatLookupKey,
	parsePlanLookupKey,
	planLookupKey,
	PLANS,
	seatLookupKey,
} from '../../tenant/plans';

export interface CheckoutInput {
	plan: TenantPlan;
	interval: BillingInterval;
	extraMembers?: number;
}

/** Stripe events that change a tenant's plan. */
const HANDLED_EVENTS = new Set([
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted',
	'invoice.payment_failed',
	'invoice.paid',
]);

/** Subscription statuses after which a subscription never bills again. */
const ENDED_STATUSES = ['canceled', 'incomplete_expired'];

const MAX_EXTRA_MEMBERS = 10_000;

/** An event still `processing` after this long was abandoned (a crash): it may be taken over. */
const ABANDONED_EVENT_MS = 5 * 60_000;

const toDate = (seconds: number | null | undefined): Date | undefined =>
	typeof seconds === 'number' ? new Date(seconds * 1000) : undefined;

const isEnded = (status: string | undefined | null) =>
	ENDED_STATUSES.includes(status ?? '');

const idOf = (value: string | { id: string } | null | undefined): string | undefined =>
	typeof value === 'string' ? value : value?.id;

interface BillingEventRecord {
	_id: string;
	type: string;
	/** missing on records written before the status existed: those are done */
	status?: 'processing' | 'done';
	at: Date;
	doneAt?: Date;
}

/**
 * Bills tenants for the cloud plans with Stripe Billing on the platform's
 * Stripe account (STRIPE_BILLING_SECRET_KEY): Checkout to subscribe, the
 * customer portal to manage, webhooks to keep the tenant's plan in step.
 * The plan is only ever read from Stripe (the subscription's price lookup
 * key), never from a client, and always from the subscription as Stripe has
 * it now, never from the (possibly old) copy inside an event.
 */
@injectable()
export class BillingService {
	private readonly log: Logger = createEverLogger({ name: 'billingService' });

	private client?: Stripe;

	/** One Checkout at a time per tenant (in this process) */
	private readonly checkoutQueues = new Map<string, Promise<unknown>>();

	constructor(
		@inject(TenantsService) private readonly tenantsService: TenantsService,
		@inject(AdminsService) private readonly adminsService: AdminsService
	) {}

	get isConfigured(): boolean {
		return env.STRIPE_BILLING_SECRET_KEY !== '';
	}

	/** Lets tests use a stub; otherwise a client of the platform account. */
	setStripeClient(client: Stripe | undefined) {
		this.client = client;
	}

	private stripe(): Stripe {
		if (this.client) {
			return this.client;
		}

		if (!this.isConfigured) {
			throw new Error('Billing is not configured on this server');
		}

		// Billing uses the SDK's own API version (Checkout, portal, lookup
		// keys); the shops' card charges keep their pinned one (helpers/stripe.ts).
		this.client = new Stripe(env.STRIPE_BILLING_SECRET_KEY, fakeApiOptions());

		return this.client;
	}

	private async currentTenant(): Promise<Tenant> {
		const tenant = await this.tenantsService.current();

		if (!tenant) {
			throw new Error('No tenant');
		}

		return tenant;
	}

	private async saveBilling(tenantId: string, patch: Partial<ITenantBilling>, plan?: TenantPlan) {
		const tenant = await this.tenantsService.getCurrent(tenantId);

		if (!tenant) {
			return;
		}

		const updated = await this.tenantsService.update(tenantId, {
			billing: { ...(tenant.billing ?? {}), ...patch },
			...(plan ? { plan } : {}),
		});

		tenantDirectory.invalidate(updated);
	}

	private async ensureCustomer(tenant: Tenant): Promise<string> {
		if (tenant.billing?.stripeCustomerId) {
			return tenant.billing.stripeCustomerId;
		}

		const owner = tenant.ownerId
			? await this.adminsService.getCurrent(tenant.ownerId)
			: null;

		const customer = await this.stripe().customers.create(
			{
				name: tenant.name,
				email: owner?.email,
				metadata: { tenantId: tenant.id, tenantSlug: tenant.slug },
			},
			// two servers creating the customer at once get the same one
			{ idempotencyKey: `tenant-customer-${tenant.id}` }
		);

		await this.saveBilling(tenant.id, { stripeCustomerId: customer.id });

		return customer.id;
	}

	private async priceId(lookupKey: string): Promise<string> {
		const prices = await this.stripe().prices.list({
			lookup_keys: [lookupKey],
			active: true,
			limit: 1,
		});

		const price = prices.data[0];

		if (!price) {
			throw new Error(`Stripe has no active price ${lookupKey}`);
		}

		return price.id;
	}

	/** Runs `fn` after every earlier Checkout of the tenant (in this process) finished. */
	private async oneCheckoutAtATime<R>(tenantId: string, fn: () => Promise<R>): Promise<R> {
		const before = this.checkoutQueues.get(tenantId) ?? Promise.resolve();
		const run = before.catch(() => undefined).then(fn);
		const settled = run.catch(() => undefined);

		this.checkoutQueues.set(tenantId, settled);

		try {
			return await run;
		} finally {
			if (this.checkoutQueues.get(tenantId) === settled) {
				this.checkoutQueues.delete(tenantId);
			}
		}
	}

	/**
	 * Refuses a second subscription: the tenant's own record, and Stripe's
	 * list of the customer's subscriptions (a Checkout completed a moment ago
	 * may not have reached the webhook yet).
	 */
	private async assertNoLiveSubscription(tenant: Tenant, customer: string) {
		const message = 'This business has a subscription: change it in the billing portal';

		if (tenant.billing?.stripeSubscriptionId && !isEnded(tenant.billing.status)) {
			throw new Error(message);
		}

		const subscriptions = await this.stripe().subscriptions.list({
			customer,
			status: 'all',
			limit: 20,
		});

		if (subscriptions.data.some((s) => !isEnded(s.status))) {
			throw new Error(message);
		}
	}

	/**
	 * A Checkout Session for a paid plan of the current tenant; returns its URL.
	 * A tenant has at most one open session: asking again for the same plan
	 * returns it, asking for another plan expires it first.
	 */
	async createCheckout(input: CheckoutInput): Promise<{ url: string }> {
		const def = PLANS[input?.plan];

		if (!def || !def.paid) {
			throw new Error('Choose a paid plan');
		}

		if (!BILLING_INTERVALS.includes(input.interval)) {
			throw new Error('Choose monthly or annual billing');
		}

		const extra = Math.floor(Number(input.extraMembers ?? 0));

		if (!Number.isFinite(extra) || extra < 0 || extra > MAX_EXTRA_MEMBERS) {
			throw new Error('Extra members must be between 0 and 10000');
		}

		if (extra > 0 && !def.extraMembers) {
			throw new Error(`The ${def.label} plan has no extra members`);
		}

		const { id: tenantId } = await this.currentTenant();

		return this.oneCheckoutAtATime(tenantId, async () => {
			// read again: an earlier Checkout may have just saved its session
			const tenant = await this.currentTenant();
			const customer = await this.ensureCustomer(tenant);

			await this.assertNoLiveSubscription(tenant, customer);

			const key = `${input.plan}:${input.interval}:${extra}`;
			const pending = tenant.billing?.checkoutSessionId;

			if (pending) {
				const open = await this.openSession(pending);

				if (open?.url && tenant.billing?.checkoutKey === key) {
					return { url: open.url };
				}

				if (open) {
					await this.stripe().checkout.sessions.expire(open.id);
				}
			}

			const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
				{ price: await this.priceId(planLookupKey(input.plan, input.interval)), quantity: 1 },
			];

			if (extra > 0) {
				lineItems.push({
					price: await this.priceId(seatLookupKey(input.plan, input.interval)),
					quantity: extra,
				});
			}

			// one trial per tenant: none after a cancelled subscription
			const trialDays =
				!tenant.billing?.stripeSubscriptionId && env.BILLING_TRIAL_DAYS > 0
					? env.BILLING_TRIAL_DAYS
					: undefined;

			const base = env.ADMIN_APP_URL.replace(/\/+$/, '');

			const session = await this.stripe().checkout.sessions.create(
				{
					mode: 'subscription',
					customer,
					client_reference_id: tenant.id,
					line_items: lineItems,
					payment_method_collection: 'always',
					subscription_data: {
						metadata: { tenantId: tenant.id },
						...(trialDays ? { trial_period_days: trialDays } : {}),
					},
					metadata: { tenantId: tenant.id },
					success_url: `${base}/#/settings/billing?checkout=success`,
					cancel_url: `${base}/#/settings/billing?checkout=cancelled`,
				},
				// two servers asked at once for the same plan get the same session
				{ idempotencyKey: `tenant-checkout-${tenant.id}-${key}-${pending ?? 'first'}` }
			);

			if (!session.url) {
				throw new Error('Stripe returned no Checkout URL');
			}

			await this.saveBilling(tenant.id, {
				checkoutSessionId: session.id,
				checkoutKey: key,
				checkoutExpiresAt: toDate(session.expires_at),
			});

			return { url: session.url };
		});
	}

	/** The session when it can still be paid, else null. */
	private async openSession(id: string): Promise<Stripe.Checkout.Session | null> {
		try {
			const session = await this.stripe().checkout.sessions.retrieve(id);

			return session.status === 'open' ? session : null;
		} catch (err: any) {
			if (err?.statusCode === 404) {
				return null;
			}

			throw err;
		}
	}

	/** A customer portal session of the current tenant (invoices, card, plan, cancel). */
	async createPortal(): Promise<{ url: string }> {
		const tenant = await this.currentTenant();

		if (!tenant.billing?.stripeCustomerId) {
			throw new Error('This business has no billing account yet: choose a plan first');
		}

		const session = await this.stripe().billingPortal.sessions.create({
			customer: tenant.billing.stripeCustomerId,
			return_url: `${env.ADMIN_APP_URL.replace(/\/+$/, '')}/#/settings/billing`,
		});

		return { url: session.url };
	}

	/**
	 * Verifies and applies a Stripe webhook event. Each event is applied once
	 * (event ids are kept in `billingevents`). Returns whether it was applied.
	 */
	async handleWebhook(rawBody: Buffer | string, signature: string | undefined): Promise<boolean> {
		if (!env.STRIPE_BILLING_WEBHOOK_SECRET) {
			throw new Error('Billing webhooks are not configured');
		}

		if (!signature) {
			throw new WebhookSignatureError('Missing Stripe-Signature header');
		}

		let event: Stripe.Event;

		try {
			event = this.stripe().webhooks.constructEvent(
				rawBody,
				signature,
				env.STRIPE_BILLING_WEBHOOK_SECRET
			);
		} catch (err) {
			throw new WebhookSignatureError((err as Error).message);
		}

		return this.applyEvent(event);
	}

	private events() {
		return mongoose.connection.collection<BillingEventRecord>('billingevents');
	}

	/**
	 * Takes an event for this server: `claimed` (apply it), `done` (applied
	 * before: a replay), `busy` (another server is applying it right now).
	 * An event left `processing` by a crash is taken over after
	 * ABANDONED_EVENT_MS, so Stripe's retry still applies it.
	 */
	private async claimEvent(event: Stripe.Event): Promise<'claimed' | 'done' | 'busy'> {
		const events = this.events();
		const now = new Date();

		try {
			await events.insertOne({ _id: event.id, type: event.type, status: 'processing', at: now });
			return 'claimed';
		} catch (err: any) {
			if (err?.code !== 11000) {
				throw err;
			}
		}

		const existing = await events.findOne({ _id: event.id });

		if (!existing) {
			return 'busy'; // the other server just gave it up: Stripe retries
		}

		if (existing.status !== 'processing') {
			return 'done';
		}

		if (now.getTime() - new Date(existing.at).getTime() < ABANDONED_EVENT_MS) {
			return 'busy';
		}

		const taken = await events.updateOne(
			{ _id: event.id, status: 'processing', at: existing.at },
			{ $set: { at: now } }
		);

		return taken.modifiedCount === 1 ? 'claimed' : 'busy';
	}

	/** Applies a verified event (separate from the signature check for tests). */
	async applyEvent(event: Stripe.Event): Promise<boolean> {
		if (!HANDLED_EVENTS.has(event.type)) {
			return false;
		}

		const claim = await this.claimEvent(event);

		if (claim === 'done') {
			return false; // replayed
		}

		if (claim === 'busy') {
			throw new BillingEventBusyError(event.id);
		}

		try {
			await TenantContext.runAsSystem('apply a Stripe billing event', () =>
				this.dispatch(event)
			);
		} catch (err) {
			// let Stripe retry: forget the event id
			await this.events().deleteOne({ _id: event.id, status: 'processing' });
			throw err;
		}

		await this.events().updateOne(
			{ _id: event.id },
			{ $set: { status: 'done', doneAt: new Date() } }
		);

		this.log.info({ eventId: event.id, type: event.type }, 'billing event applied');

		return true;
	}

	/** The subscription as Stripe has it now; null when Stripe no longer knows it. */
	private async freshSubscription(id: string): Promise<Stripe.Subscription | null> {
		try {
			return await this.stripe().subscriptions.retrieve(id);
		} catch (err: any) {
			if (err?.statusCode === 404) {
				return null;
			}

			throw err;
		}
	}

	/**
	 * Events can arrive late and out of order, so each one only names the
	 * subscription that changed: its current state is read from Stripe.
	 */
	private async dispatch(event: Stripe.Event): Promise<void> {
		let subscriptionId: string | undefined;
		let tenantIdHint: string | undefined;

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				tenantIdHint = session.client_reference_id ?? session.metadata?.tenantId ?? undefined;
				subscriptionId = idOf(session.subscription as any);

				if (!tenantIdHint) {
					return;
				}
				break;
			}

			case 'customer.subscription.created':
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted':
				subscriptionId = (event.data.object as Stripe.Subscription).id;
				break;

			case 'invoice.payment_failed':
			case 'invoice.paid': {
				// past_due and its grace period follow the subscription's status
				const invoice = event.data.object as any;
				subscriptionId =
					idOf(invoice.subscription) ??
					idOf(invoice.parent?.subscription_details?.subscription);
				break;
			}
		}

		if (!subscriptionId) {
			return;
		}

		const subscription = await this.freshSubscription(subscriptionId);

		if (!subscription) {
			this.log.warn({ eventId: event.id, subscriptionId }, 'billing event of an unknown subscription');
			return;
		}

		await this.applySubscription(subscription, tenantIdHint);
	}

	private async tenantByCustomer(customerId: string): Promise<Tenant | null> {
		const [tenant] = await this.tenantsService.find({
			'billing.stripeCustomerId': customerId,
		} as any);

		return tenant ?? null;
	}

	/**
	 * Whether `subscription` may become (or stay) the tenant's subscription.
	 * A tenant has one: an ended subscription that is not the tenant's own
	 * never replaces it (an old cancellation), and a second live one is not
	 * taken while the tenant's own still runs.
	 */
	private async replacesTenantSubscription(tenant: Tenant, subscription: Stripe.Subscription) {
		const currentId = tenant.billing?.stripeSubscriptionId;

		if (!currentId || currentId === subscription.id) {
			return true;
		}

		if (isEnded(subscription.status)) {
			this.log.info(
				{ tenantId: tenant.id, subscriptionId: subscription.id, currentId },
				'ended subscription that is not the tenant\'s current one: ignored'
			);
			return false;
		}

		// the tenant's record may be behind: ask Stripe whether its own one still runs
		const current = isEnded(tenant.billing?.status) ? null : await this.freshSubscription(currentId);

		if (current && !isEnded(current.status)) {
			this.log.error(
				{ tenantId: tenant.id, subscriptionId: subscription.id, currentId },
				'a second live subscription of one tenant: not applied, cancel one of them in Stripe'
			);
			return false;
		}

		return true;
	}

	/** Writes the plan, members and dates of a subscription (as Stripe has it now) to its tenant. */
	async applySubscription(subscription: Stripe.Subscription, tenantIdHint?: string) {
		const customerId = idOf(subscription.customer as any);

		let tenant: Tenant | null = null;
		const metaTenantId = subscription.metadata?.tenantId ?? tenantIdHint;

		if (metaTenantId) {
			tenant = await this.tenantsService.getCurrent(metaTenantId);
		}

		if (!tenant && customerId) {
			tenant = await this.tenantByCustomer(customerId);
		}

		if (!tenant) {
			this.log.warn({ subscriptionId: subscription.id }, 'subscription of no known tenant');
			return;
		}

		if (customerId && tenant.billing?.stripeCustomerId && tenant.billing.stripeCustomerId !== customerId) {
			this.log.warn(
				{ tenantId: tenant.id, subscriptionId: subscription.id },
				'subscription of another Stripe customer than the tenant has: ignored'
			);
			return;
		}

		if (!(await this.replacesTenantSubscription(tenant, subscription))) {
			return;
		}

		let plan: TenantPlan | null = null;
		let interval: BillingInterval | undefined;
		let extraMembers = 0;
		let periodEnd: number | undefined;

		for (const item of subscription.items?.data ?? []) {
			const key = item.price?.lookup_key;
			const parsed = parsePlanLookupKey(key);

			if (parsed) {
				plan = parsed.plan;
				interval = parsed.interval;
			} else if (isSeatLookupKey(key)) {
				extraMembers += item.quantity ?? 0;
			}

			periodEnd ??= (item as any).current_period_end;
		}

		periodEnd ??= (subscription as any).current_period_end;

		const ended = isEnded(subscription.status);

		await this.saveBilling(
			tenant.id,
			{
				stripeCustomerId: customerId ?? tenant.billing?.stripeCustomerId,
				stripeSubscriptionId: subscription.id,
				status: subscription.status,
				interval,
				extraMembers,
				trialEndsAt: toDate(subscription.trial_end),
				currentPeriodEnd: toDate(periodEnd),
				...(subscription.status === 'past_due'
					? { pastDueSince: tenant.billing?.pastDueSince ?? new Date() }
					: { pastDueSince: undefined }),
				// the Checkout is done: the next one starts fresh
				checkoutSessionId: undefined,
				checkoutKey: undefined,
				checkoutExpiresAt: undefined,
			},
			ended ? 'starter' : plan ?? undefined
		);
	}
}

/**
 * Tests only: STRIPE_BILLING_API_URL points the billing client at a fake
 * Stripe API (host, port, protocol); empty = api.stripe.com.
 */
function fakeApiOptions(): Stripe.StripeConfig | undefined {
	if (!env.STRIPE_BILLING_API_URL) {
		return undefined;
	}

	const url = new URL(env.STRIPE_BILLING_API_URL);

	return {
		host: url.hostname,
		port: url.port || (url.protocol === 'http:' ? 80 : 443),
		protocol: url.protocol.replace(':', '') as 'http' | 'https',
		maxNetworkRetries: 0,
	};
}

export class WebhookSignatureError extends Error {
	readonly name = 'WebhookSignatureError';
}

/** Another server is applying the event right now: Stripe should retry later. */
export class BillingEventBusyError extends Error {
	readonly name = 'BillingEventBusyError';

	constructor(eventId: string) {
		super(`Billing event ${eventId} is being applied`);
	}
}
