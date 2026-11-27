import { DBCreateObject, DBRawObject, PyroObjectId } from '@pyro/db';

/** Plans of the cloud edition (lookup keys `ever_demand_cloud_<plan>_<interval>`). */
export type TenantPlan = 'starter' | 'small_business' | 'enterprise';

export const TENANT_PLANS: TenantPlan[] = [
	'starter',
	'small_business',
	'enterprise',
];

export type TenantStatus = 'active' | 'suspended' | 'deleted';

export type BillingInterval = 'monthly' | 'annual';

/** Role of an admin inside its tenant. */
export type TenantRole = 'owner' | 'admin' | 'staff';

export const TENANT_ROLES: TenantRole[] = ['owner', 'admin', 'staff'];

export interface ITenantBilling {
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	/** Stripe subscription status: trialing, active, past_due, canceled, ... */
	status?: string;
	interval?: BillingInterval;
	/** Members bought on top of the ones the plan includes */
	extraMembers?: number;
	trialEndsAt?: Date | string;
	currentPeriodEnd?: Date | string;
	/** When the subscription became past_due (start of the grace period) */
	pastDueSince?: Date | string;
	/** Open Checkout Session (reused for the same plan, expired for another) */
	checkoutSessionId?: string;
	/** `<plan>:<interval>:<extraMembers>` of that session */
	checkoutKey?: string;
	checkoutExpiresAt?: Date | string;
}

export interface ITenantSettings {
	currency?: string;
	language?: string;
	logoUrl?: string;
	/** Extra host names that resolve to this tenant (custom domains, later) */
	domains?: string[];
	/** Listed in a future public marketplace (not used yet) */
	marketplaceListed?: boolean;
}

/**
 * Fields every tenant-owned record carries. The server always sets
 * `tenantId` from the tenant context; a value sent by a client is ignored.
 */
export interface ITenantScoped {
	tenantId?: string;
}

export interface ITenantCreateObject extends DBCreateObject {
	name: string;
	/** Sub-domain and short code: `<slug>.everdemand.co` */
	slug: string;
	status?: TenantStatus;
	ownerId?: string;
	plan?: TenantPlan;
	billing?: ITenantBilling;
	settings?: ITenantSettings;
	/** The tenant that holds the platform super-admins (the default tenant) */
	isPlatform?: boolean;
	isDeleted?: boolean;
}

interface ITenant extends DBRawObject, ITenantCreateObject {
	_id: PyroObjectId;
}

export default ITenant;
