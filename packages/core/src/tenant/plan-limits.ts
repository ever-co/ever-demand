import Admin from '@modules/server.common/entities/Admin';
import Carrier from '@modules/server.common/entities/Carrier';
import Warehouse from '@modules/server.common/entities/Warehouse';
import type { TenantPlan } from '@modules/server.common/interfaces/ITenant';
import { getModel } from '@pyro/db-server/model';
import { env } from '../env';
import { TenantContext } from './tenant-context';
import { tenantDirectory } from './tenant-directory';
import { effectivePlan, memberLimit, PLANS } from './plans';

export interface TenantUsage {
	plan: TenantPlan;
	/** The plan whose limits apply (Starter after a cancellation or a long past-due) */
	effectivePlan: TenantPlan;
	members: number;
	admins: number;
	carriers: number;
	stores: number;
	includedMembers: number | null;
	extraMembers: number;
	memberLimit: number | null;
	storeLimit: number | null;
	/** Limits are enforced (multi-tenant install) */
	enforced: boolean;
}

/** A tenant would go over its plan's members or stores. */
export class PlanLimitReachedError extends Error {
	readonly name = 'PlanLimitReachedError';
	readonly code = 'PLAN_LIMIT_REACHED';

	constructor(
		readonly kind: 'member' | 'store',
		readonly limit: number,
		readonly plan: TenantPlan,
	) {
		super(
			`Your ${PLANS[plan].label} plan allows ${limit} ${kind === 'member' ? 'members' : 'stores'}. ` +
				'Upgrade the plan or buy more members in Settings → Billing.',
		);
	}
}

const notDeleted = { isDeleted: { $ne: true } };

/** Members (admins + carriers + store logins) and stores of the current tenant. */
export async function tenantUsage(): Promise<TenantUsage> {
	const tenantId = TenantContext.requireTenantId('plan usage');
	const tenant = await tenantDirectory.byId(tenantId);

	const [admins, carriers, stores] = await Promise.all([
		(getModel(Admin) as any).countDocuments(notDeleted).exec(),
		(getModel(Carrier) as any).countDocuments(notDeleted).exec(),
		(getModel(Warehouse) as any).countDocuments(notDeleted).exec(),
	]);

	const plan: TenantPlan = tenant?.plan ?? 'starter';
	const applied = effectivePlan(
		plan,
		tenant?.billing,
		env.BILLING_PAST_DUE_GRACE_DAYS,
	);
	const def = PLANS[applied];
	const enforced = env.MULTI_TENANT && tenant?.isPlatform !== true;

	return {
		plan,
		effectivePlan: applied,
		members: admins + carriers + stores,
		admins,
		carriers,
		stores,
		includedMembers: def.includedMembers,
		extraMembers: def.extraMembers
			? Number(tenant?.billing?.extraMembers ?? 0)
			: 0,
		memberLimit: enforced ? memberLimit(applied, tenant?.billing) : null,
		storeLimit: enforced ? def.maxStores : null,
		enforced,
	};
}

/**
 * Throws PlanLimitReachedError when adding `kind` would go over the plan of
 * the current tenant. A store is also a member (its login). Single-tenant
 * installs and the platform tenant have no limits.
 */
export async function assertCanAdd(kind: 'member' | 'store'): Promise<void> {
	if (!env.MULTI_TENANT || TenantContext.isSystem()) {
		return;
	}

	const usage = await tenantUsage();

	if (!usage.enforced) {
		return;
	}

	if (usage.memberLimit != null && usage.members + 1 > usage.memberLimit) {
		throw new PlanLimitReachedError(
			'member',
			usage.memberLimit,
			usage.effectivePlan,
		);
	}

	if (
		kind === 'store' &&
		usage.storeLimit != null &&
		usage.stores + 1 > usage.storeLimit
	) {
		throw new PlanLimitReachedError(
			'store',
			usage.storeLimit,
			usage.effectivePlan,
		);
	}
}
