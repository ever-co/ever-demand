import { Mutation, Query, Resolver } from '@nestjs/graphql';
import type Tenant from '@modules/server.common/entities/Tenant';
import type { TenantRole, TenantStatus } from '@modules/server.common/interfaces/ITenant';
import { TenantsService, TenantSignupInput } from '../../services/tenants/TenantsService';
import { BillingService, CheckoutInput } from '../../services/billing/BillingService';
import { PLANS } from '../../tenant/plans';
import { tenantDirectory } from '../../tenant/tenant-directory';
import type { GraphQLContext } from '../graphql-context';

/** The GraphQL shape of a tenant: Stripe ids stay on the server. */
export function toTenantView(tenant: Tenant | null) {
	if (!tenant) {
		return null;
	}

	const billing = tenant.billing ?? {};

	return {
		id: tenant.id,
		name: tenant.name,
		slug: tenant.slug,
		status: tenant.status ?? 'active',
		plan: tenant.plan ?? 'starter',
		ownerId: tenant.ownerId,
		isPlatform: tenant.isPlatform === true,
		createdAt: tenant.createdAt,
		settings: {
			currency: tenant.settings?.currency,
			language: tenant.settings?.language,
			logoUrl: tenant.settings?.logoUrl,
			domains: tenant.settings?.domains ?? [],
		},
		billing: {
			status: billing.status,
			interval: billing.interval,
			extraMembers: billing.extraMembers ?? 0,
			trialEndsAt: billing.trialEndsAt,
			currentPeriodEnd: billing.currentPeriodEnd,
			hasCustomer: !!billing.stripeCustomerId,
			hasSubscription: !!billing.stripeSubscriptionId,
		},
	};
}

function clientAddress(context: GraphQLContext): string | undefined {
	const req: any = context?.req;
	return req?.clientIp ?? req?.ip ?? req?.socket?.remoteAddress;
}

/** Tenants, signup, members and billing. Who may call what: graphql/access. */
@Resolver('Tenant')
export class TenantsResolver {
	constructor(
		private readonly _tenantsService: TenantsService,
		private readonly _billingService: BillingService
	) {}

	@Query()
	async currentTenant() {
		return toTenantView(await this._tenantsService.current());
	}

	@Query()
	async tenantBySlug(_, { slug }: { slug: string }) {
		const tenant = await tenantDirectory.bySlug(slug);

		if (!tenant || tenant.status !== 'active') {
			return null;
		}

		return {
			id: tenant.id,
			name: tenant.name,
			slug: tenant.slug,
			logoUrl: tenant.settings?.logoUrl,
		};
	}

	@Query()
	async isTenantSlugAvailable(_, { slug }: { slug: string }) {
		return this._tenantsService.isSlugAvailable(slug);
	}

	@Query()
	tenantPlans() {
		return Object.values(PLANS).map((p) => ({
			plan: p.plan,
			label: p.label,
			includedMembers: p.includedMembers,
			extraMembers: p.extraMembers,
			maxStores: p.maxStores,
			monthlyPrice: p.monthlyPrice.monthly,
			annualMonthlyPrice: p.monthlyPrice.annual,
			extraMemberPrice: p.extraMemberPrice,
			paid: p.paid,
		}));
	}

	@Query()
	async tenantUsage() {
		return this._tenantsService.usage();
	}

	@Query()
	async tenantMembers() {
		return this._tenantsService.members();
	}

	@Query()
	async tenants() {
		const list = await this._tenantsService.listAll();
		return list.map((item) => ({ ...item, tenant: toTenantView(item.tenant) }));
	}

	@Mutation()
	async signupTenant(
		_,
		{ input }: { input: TenantSignupInput },
		context: GraphQLContext
	) {
		const result = await this._tenantsService.signup(input, clientAddress(context));
		return { ...result, tenant: toTenantView(result.tenant) };
	}

	@Mutation()
	async updateTenant(_, { input }: { input: { name?: string; settings?: any } }) {
		return toTenantView(await this._tenantsService.updateCurrent(input));
	}

	@Mutation()
	async setAdminRole(_, { adminId, role }: { adminId: string; role: TenantRole }) {
		return this._tenantsService.setAdminRole(adminId, role);
	}

	@Mutation()
	async removeAdmin(_, { adminId }: { adminId: string }) {
		return this._tenantsService.removeAdmin(adminId);
	}

	@Mutation()
	async createBillingCheckout(_, { input }: { input: CheckoutInput }) {
		return this._billingService.createCheckout(input);
	}

	@Mutation()
	async createBillingPortal() {
		return this._billingService.createPortal();
	}

	@Mutation()
	async setTenantStatus(
		_,
		{ tenantId, status }: { tenantId: string; status: TenantStatus }
	) {
		return toTenantView(await this._tenantsService.setStatus(tenantId, status));
	}
}
