import type {
	BillingInterval,
	ITenantBilling,
	TenantPlan,
} from '@modules/server.common/interfaces/ITenant';

/**
 * Cloud plans (workspace docs/billing/2026-10-pricing/TARGET-PRICING-SPEC.md
 * + 2026-11-01 amendments): priced by members and usage, never by features.
 * Labels: Starter, Business (key small_business), Unlimited (key enterprise).
 *
 * A member is an admin login (owner / admin / staff), a carrier or a store
 * login; customers are never members. Store limits are the proposal of
 * DESIGN.md §3.6 (owner to confirm, Q6).
 */
export interface PlanDefinition {
	plan: TenantPlan;
	label: string;
	/** Members included in the price; null = unlimited */
	includedMembers: number | null;
	/** Whether more members can be bought (seat add-on) */
	extraMembers: boolean;
	/** Stores (warehouses); null = unlimited */
	maxStores: number | null;
	/** USD per month, monthly and annual billing (annual is billed × 12) */
	monthlyPrice: { monthly: number; annual: number };
	/** USD per extra member per month */
	extraMemberPrice: number | null;
	paid: boolean;
}

export const PLANS: Readonly<Record<TenantPlan, PlanDefinition>> = {
	starter: {
		plan: 'starter',
		label: 'Starter',
		includedMembers: 15,
		extraMembers: false,
		maxStores: 3,
		monthlyPrice: { monthly: 0, annual: 0 },
		extraMemberPrice: null,
		paid: false,
	},
	small_business: {
		plan: 'small_business',
		label: 'Business',
		includedMembers: 25,
		extraMembers: true,
		maxStores: 3,
		monthlyPrice: { monthly: 49, annual: 34 },
		extraMemberPrice: 5,
		paid: true,
	},
	enterprise: {
		plan: 'enterprise',
		label: 'Unlimited',
		// Option 2: unlimited stores, 50 members included, +$10 each.
		// (Option 1, one store with unlimited members, is a later choice.)
		includedMembers: 50,
		extraMembers: true,
		maxStores: null,
		monthlyPrice: { monthly: 499, annual: 349 },
		extraMemberPrice: 10,
		paid: true,
	},
};

export const BILLING_INTERVALS: BillingInterval[] = ['monthly', 'annual'];

/** Stripe lookup key of a plan price (shared with the ever.co catalog). */
export function planLookupKey(
	plan: TenantPlan,
	interval: BillingInterval,
): string {
	return `ever_demand_cloud_${plan}_${interval}`;
}

/** Stripe lookup key of the per-member add-on price. */
export function seatLookupKey(
	plan: TenantPlan,
	interval: BillingInterval,
): string {
	return `ever_seat_demand_cloud_${plan}_${interval}`;
}

const PLAN_KEY =
	/^ever_demand_cloud_(starter|small_business|enterprise)_(monthly|annual)$/;
const SEAT_KEY =
	/^ever_seat_demand_cloud_(?:starter|small_business|enterprise)_(?:monthly|annual)$/;

export function parsePlanLookupKey(
	key: string | null | undefined,
): { plan: TenantPlan; interval: BillingInterval } | null {
	const m = PLAN_KEY.exec(String(key ?? ''));
	return m
		? { plan: m[1] as TenantPlan, interval: m[2] as BillingInterval }
		: null;
}

export function isSeatLookupKey(key: string | null | undefined): boolean {
	return SEAT_KEY.test(String(key ?? ''));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The plan whose limits apply now: a cancelled subscription, or one past due
 * for longer than the grace period, falls back to Starter. Billing never
 * deletes data; over the limit, only adding is refused.
 */
export function effectivePlan(
	plan: TenantPlan | undefined,
	billing: ITenantBilling | undefined,
	graceDays: number,
	now: number = Date.now(),
): TenantPlan {
	const current: TenantPlan = plan && PLANS[plan] ? plan : 'starter';

	if (!PLANS[current].paid || !billing?.stripeSubscriptionId) {
		// paid plans without a subscription are set by a super-admin (e.g. the default tenant)
		return current;
	}

	const status = billing.status ?? 'active';

	if (['canceled', 'incomplete_expired', 'unpaid'].includes(status)) {
		return 'starter';
	}

	if (status === 'past_due' && billing.pastDueSince) {
		const since = new Date(billing.pastDueSince).getTime();

		if (now - since > graceDays * DAY_MS) {
			return 'starter';
		}
	}

	return current;
}

/** Members a tenant may have: included + bought; null = unlimited. */
export function memberLimit(
	plan: TenantPlan,
	billing: ITenantBilling | undefined,
): number | null {
	const def = PLANS[plan];

	if (def.includedMembers == null) {
		return null;
	}

	const extra = def.extraMembers
		? Math.max(0, Number(billing?.extraMembers ?? 0))
		: 0;

	return def.includedMembers + extra;
}
