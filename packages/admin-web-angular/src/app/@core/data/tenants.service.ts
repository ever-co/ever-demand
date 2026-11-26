import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom, type Observable } from 'rxjs';
import { getDummyImage } from '@modules/server.common/utils';
import { resultErrors } from '@app/graphql/result-errors';
import type { TenantRole } from '../tenant/tenant-rules';

/** GraphQL shapes of packages/core/src/graphql/tenants/tenants.types.graphql */
export interface TenantBillingView {
	status?: string | null;
	interval?: string | null;
	extraMembers?: number | null;
	trialEndsAt?: string | null;
	currentPeriodEnd?: string | null;
	hasCustomer: boolean;
	hasSubscription: boolean;
}

export interface TenantSettingsView {
	currency?: string | null;
	language?: string | null;
	logoUrl?: string | null;
	domains?: string[] | null;
}

export interface TenantView {
	id: string;
	name: string;
	slug: string;
	status: string;
	plan: string;
	ownerId?: string | null;
	isPlatform: boolean;
	billing: TenantBillingView;
	settings: TenantSettingsView;
	createdAt?: string | null;
}

export interface TenantUsageView {
	plan: string;
	effectivePlan: string;
	members: number;
	admins: number;
	carriers: number;
	stores: number;
	includedMembers?: number | null;
	extraMembers: number;
	memberLimit?: number | null;
	storeLimit?: number | null;
	enforced: boolean;
}

export interface TenantPlanView {
	plan: string;
	label: string;
	includedMembers?: number | null;
	extraMembers: boolean;
	maxStores?: number | null;
	monthlyPrice: number;
	annualMonthlyPrice: number;
	extraMemberPrice?: number | null;
	paid: boolean;
}

export interface TenantMemberView {
	id: string;
	name: string;
	email: string;
	role: TenantRole;
	isSuperAdmin: boolean;
}

/** The admin as a login (and a signup) returns it. */
export interface SessionAdmin {
	id: string;
	email: string;
	name?: string;
	pictureUrl?: string;
	role?: string | null;
	isSuperAdmin?: boolean | null;
	tenantId?: string | null;
}

export interface TenantSignupInput {
	businessName: string;
	slug: string;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

export interface TenantSignupResult {
	token: string;
	tenant: TenantView;
	admin: SessionAdmin;
}

export interface TenantListItemView {
	tenant: TenantView;
	members: number;
	stores: number;
}

export interface MemberInvite {
	name: string;
	email: string;
	password: string;
	role: TenantRole;
}

export type BillingInterval = 'monthly' | 'annual';

export interface BillingCheckoutInput {
	plan: string;
	interval: BillingInterval;
	extraMembers?: number;
}

const TENANT_FIELDS = `
	id
	name
	slug
	status
	plan
	ownerId
	isPlatform
	createdAt
	billing {
		status
		interval
		extraMembers
		trialEndsAt
		currentPeriodEnd
		hasCustomer
		hasSubscription
	}
	settings {
		currency
		language
		logoUrl
		domains
	}
`;

/** Fields of the admin a session keeps (AdminAuthStrategy and the signup). */
export const SESSION_ADMIN_FIELDS = `
	_id
	id
	email
	name
	pictureUrl
	role
	isSuperAdmin
	tenantId
`;

/** The data of a query / mutation result, or the first GraphQL error thrown. */
async function dataOf<T>(request: Observable<any>, field: string): Promise<T> {
	const res = await firstValueFrom(request);
	const errors = resultErrors(res);

	if (errors?.length) {
		throw new Error(errors[0].message);
	}

	return res?.data?.[field] as T;
}

/**
 * Tenants, signup, plans, members and billing (DESIGN.md §6). Who may call
 * what is the API's graphql-access table; the screens hide what a role may
 * not do (tenant-rules.ts).
 */
@Injectable()
export class TenantsService {
	constructor(private readonly apollo: Apollo) {}

	plans(): Promise<TenantPlanView[]> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query TenantPlans {
						tenantPlans {
							plan
							label
							includedMembers
							extraMembers
							maxStores
							monthlyPrice
							annualMonthlyPrice
							extraMemberPrice
							paid
						}
					}
				`,
			}),
			'tenantPlans',
		);
	}

	isSlugAvailable(slug: string): Promise<boolean> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query IsTenantSlugAvailable($slug: String!) {
						isTenantSlugAvailable(slug: $slug)
					}
				`,
				variables: { slug },
			}),
			'isTenantSlugAvailable',
		);
	}

	signup(input: TenantSignupInput): Promise<TenantSignupResult> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation SignupTenant($input: TenantSignupInput!) {
						signupTenant(input: $input) {
							token
							tenant {
								${TENANT_FIELDS}
							}
							admin {
								${SESSION_ADMIN_FIELDS}
							}
						}
					}
				`,
				variables: { input },
			}),
			'signupTenant',
		);
	}

	current(): Promise<TenantView | null> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query CurrentTenant {
						currentTenant {
							${TENANT_FIELDS}
						}
					}
				`,
			}),
			'currentTenant',
		);
	}

	usage(): Promise<TenantUsageView> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query TenantUsage {
						tenantUsage {
							plan
							effectivePlan
							members
							admins
							carriers
							stores
							includedMembers
							extraMembers
							memberLimit
							storeLimit
							enforced
						}
					}
				`,
			}),
			'tenantUsage',
		);
	}

	update(input: {
		name?: string;
		settings?: { currency?: string; language?: string; logoUrl?: string };
	}): Promise<TenantView> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation UpdateTenant($input: TenantUpdateInput!) {
						updateTenant(input: $input) {
							${TENANT_FIELDS}
						}
					}
				`,
				variables: { input },
			}),
			'updateTenant',
		);
	}

	members(): Promise<TenantMemberView[]> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query TenantMembers {
						tenantMembers {
							id
							name
							email
							role
							isSuperAdmin
						}
					}
				`,
			}),
			'tenantMembers',
		);
	}

	/** A new admin or staff login of the tenant (the existing registerAdmin). */
	invite(member: MemberInvite): Promise<{ id: string }> {
		const name = member.name.trim();

		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation InviteMember($registerInput: AdminRegisterInput!) {
						registerAdmin(registerInput: $registerInput) {
							id
						}
					}
				`,
				variables: {
					registerInput: {
						admin: {
							name,
							email: member.email.trim().toLowerCase(),
							pictureUrl: getDummyImage(
								300,
								300,
								(name.charAt(0) || '?').toUpperCase(),
							),
							role: member.role,
						},
						password: member.password,
					},
				},
			}),
			'registerAdmin',
		);
	}

	setRole(adminId: string, role: TenantRole): Promise<TenantMemberView> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation SetAdminRole($adminId: String!, $role: String!) {
						setAdminRole(adminId: $adminId, role: $role) {
							id
							name
							email
							role
							isSuperAdmin
						}
					}
				`,
				variables: { adminId, role },
			}),
			'setAdminRole',
		);
	}

	remove(adminId: string): Promise<boolean> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation RemoveAdmin($adminId: String!) {
						removeAdmin(adminId: $adminId)
					}
				`,
				variables: { adminId },
			}),
			'removeAdmin',
		);
	}

	/** A Stripe Checkout session for a paid plan: redirect the browser to its url. */
	checkout(input: BillingCheckoutInput): Promise<{ url: string }> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation CreateBillingCheckout($input: BillingCheckoutInput!) {
						createBillingCheckout(input: $input) {
							url
						}
					}
				`,
				variables: {
					input: {
						plan: input.plan,
						interval: input.interval,
						extraMembers: Math.max(
							0,
							Math.floor(Number(input.extraMembers ?? 0)),
						),
					},
				},
			}),
			'createBillingCheckout',
		);
	}

	/** A Stripe customer portal session (invoices, card, plan changes). */
	portal(): Promise<{ url: string }> {
		return dataOf(
			this.apollo.mutate({
				mutation: gql`
					mutation CreateBillingPortal {
						createBillingPortal {
							url
						}
					}
				`,
			}),
			'createBillingPortal',
		);
	}

	/** Super-admin: every tenant with its members and stores. */
	list(): Promise<TenantListItemView[]> {
		return dataOf(
			this.apollo.query({
				query: gql`
					query Tenants {
						tenants {
							members
							stores
							tenant {
								id
								name
								slug
								status
								plan
								isPlatform
								createdAt
							}
						}
					}
				`,
			}),
			'tenants',
		);
	}
}
