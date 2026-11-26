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

const MAX_EXTRA_MEMBERS = 10_000;

const toDate = (seconds: number | null | undefined): Date | undefined =>
	typeof seconds === 'number' ? new Date(seconds * 1000) : undefined;

/**
 * Bills tenants for the cloud plans with Stripe Billing on the platform's
 * Stripe account (STRIPE_BILLING_SECRET_KEY): Checkout to subscribe, the
 * customer portal to manage, webhooks to keep the tenant's plan in step.
 * The plan is only ever read from Stripe (the subscription's price lookup
 * key), never from a client.
 */
@injectable()
export class BillingService {
	private readonly log: Logger = createEverLogger({ name: 'billingService' });

	private client?: Stripe;

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
		this.client = new Stripe(env.STRIPE_BILLING_SECRET_KEY);

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

		const customer = await this.stripe().customers.create({
			name: tenant.name,
			email: owner?.email,
			metadata: { tenantId: tenant.id, tenantSlug: tenant.slug },
		});

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

	/** A Checkout Session for a paid plan of the current tenant; returns its URL. */
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

		const tenant = await this.currentTenant();

		if (
			tenant.billing?.stripeSubscriptionId &&
			!['canceled', 'incomplete_expired'].includes(tenant.billing.status ?? '')
		) {
			throw new Error('This business has a subscription: change it in the billing portal');
		}

		const customer = await this.ensureCustomer(tenant);

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

		const session = await this.stripe().checkout.sessions.create({
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
		});

		if (!session.url) {
			throw new Error('Stripe returned no Checkout URL');
		}

		return { url: session.url };
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

	/** Applies a verified event (separate from the signature check for tests). */
	async applyEvent(event: Stripe.Event): Promise<boolean> {
		if (!HANDLED_EVENTS.has(event.type)) {
			return false;
		}

		const events = mongoose.connection.collection<{ _id: string; type: string; at: Date }>(
			'billingevents'
		);

		try {
			await events.insertOne({ _id: event.id, type: event.type, at: new Date() });
		} catch (err: any) {
			if (err?.code === 11000) {
				return false; // replayed
			}
			throw err;
		}

		try {
			await TenantContext.runAsSystem('apply a Stripe billing event', () =>
				this.dispatch(event)
			);
		} catch (err) {
			// let Stripe retry: forget the event id
			await events.deleteOne({ _id: event.id });
			throw err;
		}

		this.log.info({ eventId: event.id, type: event.type }, 'billing event applied');

		return true;
	}

	private async dispatch(event: Stripe.Event): Promise<void> {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				const tenantId = session.client_reference_id ?? session.metadata?.tenantId;
				const subscriptionId =
					typeof session.subscription === 'string'
						? session.subscription
						: session.subscription?.id;

				if (tenantId && subscriptionId) {
					const subscription = await this.stripe().subscriptions.retrieve(subscriptionId);
					await this.applySubscription(subscription, tenantId);
				}
				return;
			}

			case 'customer.subscription.created':
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted':
				await this.applySubscription(event.data.object as Stripe.Subscription);
				return;

			case 'invoice.payment_failed':
			case 'invoice.paid': {
				const invoice = event.data.object as Stripe.Invoice;
				const customerId =
					typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
				const tenant = customerId ? await this.tenantByCustomer(customerId) : null;

				if (!tenant) {
					return;
				}

				if (event.type === 'invoice.payment_failed') {
					await this.saveBilling(tenant.id, {
						status: 'past_due',
						pastDueSince: tenant.billing?.pastDueSince ?? new Date(),
					});
				} else {
					await this.saveBilling(tenant.id, { pastDueSince: undefined });
				}
				return;
			}
		}
	}

	private async tenantByCustomer(customerId: string): Promise<Tenant | null> {
		const [tenant] = await this.tenantsService.find({
			'billing.stripeCustomerId': customerId,
		} as any);

		return tenant ?? null;
	}

	/** Writes the plan, members and dates of a subscription to its tenant. */
	async applySubscription(subscription: Stripe.Subscription, tenantIdHint?: string) {
		const customerId =
			typeof subscription.customer === 'string'
				? subscription.customer
				: subscription.customer?.id;

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

		const ended = ['canceled', 'incomplete_expired'].includes(subscription.status);

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
			},
			ended ? 'starter' : plan ?? undefined
		);
	}
}

export class WebhookSignatureError extends Error {
	readonly name = 'WebhookSignatureError';
}
