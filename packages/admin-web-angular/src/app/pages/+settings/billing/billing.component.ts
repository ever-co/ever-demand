import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from '@app/@core/toaster';
import {
	BillingInterval,
	TenantPlanView,
	TenantsService,
	TenantUsageView,
	TenantView,
} from '@app/@core/data/tenants.service';
import { AdminSessionService } from '@app/@core/tenant/admin-session.service';
import {
	BillingNotice,
	billingNotice,
	isHttpUrl,
	planLabel,
	TenantPermissions,
} from '@app/@core/tenant/tenant-rules';
import { BrowserNavigation } from '@app/@core/utils/browser-navigation';

/** Subscription states in which a new Checkout is allowed (BillingService.createCheckout). */
const ENDED = ['canceled', 'incomplete_expired'];

/**
 * Settings → Billing (DESIGN.md §3.7): the plan, its usage and limits, an
 * upgrade through Stripe Checkout and the Stripe customer portal. Only the
 * owner (or a super-admin) gets the buttons.
 */
@Component({
	standalone: false,
	selector: 'ea-billing',
	styleUrls: ['./billing.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './billing.component.html',
})
export class BillingComponent implements OnInit {
	readonly permissions: TenantPermissions;
	readonly planLabel = planLabel;

	tenant: TenantView | null = null;
	usage: TenantUsageView | null = null;
	plans: TenantPlanView[] = [];
	notice: BillingNotice | null = null;

	chosenPlan = '';
	interval: BillingInterval = 'monthly';
	extraMembers = 0;

	loading = true;
	busy = false;
	error: string | null = null;

	constructor(
		session: AdminSessionService,
		route: ActivatedRoute,
		private readonly tenants: TenantsService,
		private readonly toaster: ToasterService,
		private readonly browser: BrowserNavigation,
	) {
		this.permissions = session.permissions();
		this.notice = billingNotice(
			route.snapshot.queryParamMap.get('checkout'),
		);
	}

	get paidPlans(): TenantPlanView[] {
		return this.plans.filter((p) => p.paid);
	}

	get selected(): TenantPlanView | undefined {
		return this.plans.find((p) => p.plan === this.chosenPlan);
	}

	/** A new subscription can be bought (none yet, or the last one ended). */
	get canCheckout(): boolean {
		const billing = this.tenant?.billing;
		return (
			this.permissions.canManageBilling &&
			!!billing &&
			(!billing.hasSubscription || ENDED.includes(billing.status ?? ''))
		);
	}

	/** The Stripe customer portal exists once the tenant has a Stripe customer. */
	get canManage(): boolean {
		return (
			this.permissions.canManageBilling &&
			!!this.tenant?.billing?.hasCustomer
		);
	}

	async ngOnInit() {
		this.loading = true;

		try {
			const [tenant, usage, plans] = await Promise.all([
				this.tenants.current(),
				this.tenants.usage(),
				this.tenants.plans(),
			]);
			this.tenant = tenant;
			this.usage = usage;
			this.plans = plans ?? [];

			const next = this.paidPlans.find((p) => p.plan !== tenant?.plan);
			this.chosenPlan = next?.plan ?? this.paidPlans[0]?.plan ?? '';
		} catch (err) {
			this.error = (err as Error).message;
		} finally {
			this.loading = false;
		}
	}

	usedOf(used: number, limit: number | null | undefined) {
		return limit == null
			? { key: 'TENANT_VIEW.BILLING.USED_UNLIMITED', params: { used } }
			: { key: 'TENANT_VIEW.BILLING.USED_OF', params: { used, limit } };
	}

	async checkout() {
		const plan = this.selected;

		if (!this.canCheckout || !plan?.paid || this.busy) {
			return;
		}

		await this.go(() =>
			this.tenants.checkout({
				plan: plan.plan,
				interval: this.interval,
				extraMembers: plan.extraMembers ? this.extraMembers : 0,
			}),
		);
	}

	async manage() {
		if (!this.canManage || this.busy) {
			return;
		}

		await this.go(() => this.tenants.portal());
	}

	private async go(session: () => Promise<{ url: string }>) {
		this.busy = true;

		try {
			const { url } = await session();

			if (!isHttpUrl(url)) {
				throw new Error('The billing page has no valid address');
			}

			this.browser.assign(url);
		} catch (err) {
			this.toaster.pop('error', (err as Error).message);
			this.busy = false;
		}
	}
}
