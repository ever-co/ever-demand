/**
 * Pure rules of the multi-tenant screens (docs/multi-tenant/DESIGN.md §3.4,
 * §3.6, §6): tenant addresses (slugs), what each admin role may do, and the
 * labels of plans. The API enforces all of this again; the admin app only
 * uses it to suggest, validate early and hide what a role may not do.
 */

/** Role of an admin inside its tenant. */
export type TenantRole = 'owner' | 'admin' | 'staff';

export const TENANT_ROLES: TenantRole[] = ['owner', 'admin', 'staff'];

/** Roles a new member can be invited with (owners are made by a handover). */
export const INVITE_ROLES: TenantRole[] = ['admin', 'staff'];

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;

/** Same pattern as the API (packages/core/src/tenant/tenant-directory.ts). */
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/**
 * A tenant address suggested from a business name: lower case latin letters,
 * digits and single dashes, 3 to 40 characters; '' when the name has too
 * few latin letters or digits (the owner then types one).
 */
export function suggestSlug(name: string | null | undefined): string {
	const slug = String(name ?? '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '') // combining accents
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, SLUG_MAX_LENGTH)
		.replace(/-+$/g, '');

	return slug.length >= SLUG_MIN_LENGTH ? slug : '';
}

/** Why a typed address is not a valid slug (before asking the API if it is free). */
export type SlugProblem = 'REQUIRED' | 'TOO_SHORT' | 'TOO_LONG' | 'FORMAT';

export function slugProblem(
	slug: string | null | undefined,
): SlugProblem | null {
	const value = String(slug ?? '').trim();

	if (!value) {
		return 'REQUIRED';
	}

	if (value.length < SLUG_MIN_LENGTH) {
		return 'TOO_SHORT';
	}

	if (value.length > SLUG_MAX_LENGTH) {
		return 'TOO_LONG';
	}

	if (!SLUG_PATTERN.test(value) || value.includes('--')) {
		return 'FORMAT';
	}

	return null;
}

export function isValidSlug(slug: string | null | undefined): boolean {
	return slugProblem(slug) === null;
}

/**
 * The parent domain of tenant hosts as configured at build time; '' when it
 * is not set (or still the `DOCKER_` placeholder of an image whose
 * entrypoint did not replace it).
 */
export function cleanBaseDomain(value: string | null | undefined): string {
	const domain = String(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/^\.+|\.+$/g, '');

	return !domain || domain.startsWith('docker_') ? '' : domain;
}

/** `<slug>.<baseDomain>`, the shop address of a tenant; null without a base domain. */
export function shopAddress(
	slug: string | null | undefined,
	baseDomain: string | null | undefined,
): string | null {
	const domain = cleanBaseDomain(baseDomain);
	return slug && domain ? `${slug}.${domain}` : null;
}

/** What the logged-in admin may do in the tenant settings (mirrors graphql-access.ts). */
export interface TenantPermissions {
	/** Business name, logo, currency, language (owner, admin) */
	canEditTenant: boolean;
	/** Invite, change roles, remove members (owner, admin) */
	canManageMembers: boolean;
	/** Checkout and the billing portal (owner) */
	canManageBilling: boolean;
	/** Hand over ownership (owner) */
	canMakeOwner: boolean;
}

/** A platform super-admin counts as an owner of whatever tenant they act in. */
export function tenantPermissions(
	role: string | null | undefined,
	isSuperAdmin = false,
): TenantPermissions {
	const owner = isSuperAdmin || role === 'owner';
	const manager = owner || role === 'admin';

	return {
		canEditTenant: manager,
		canManageMembers: manager,
		canManageBilling: owner,
		canMakeOwner: owner,
	};
}

export interface MemberLike {
	id: string;
	role: string;
}

export interface MemberActions {
	/** Roles the member can be given (empty: the role cannot be changed here) */
	roles: TenantRole[];
	canRemove: boolean;
}

/**
 * What the logged-in admin may do to one member. The owner keeps the role
 * until another member is made owner; nobody removes the owner or themselves.
 */
export function memberActions(
	member: MemberLike,
	myAdminId: string | null | undefined,
	permissions: TenantPermissions,
): MemberActions {
	if (!permissions.canManageMembers || member.role === 'owner') {
		return { roles: [], canRemove: false };
	}

	return {
		roles: permissions.canMakeOwner ? TENANT_ROLES : INVITE_ROLES,
		canRemove: member.id !== myAdminId,
	};
}

/** Plan keys of the API (Stripe lookup keys) and how the screens name them. */
export const PLAN_LABELS: Readonly<Record<string, string>> = {
	starter: 'Starter',
	small_business: 'Business',
	enterprise: 'Unlimited',
};

export function planLabel(plan: string | null | undefined): string {
	return PLAN_LABELS[plan ?? ''] ?? String(plan ?? '');
}

/**
 * Why the browser came back to Settings → Billing: Stripe Checkout returns with
 * `?checkout=success|cancelled`, the signup with `failed` when Checkout could
 * not be opened.
 */
export type BillingNotice = 'success' | 'cancelled' | 'failed';

export function billingNotice(value: unknown): BillingNotice | null {
	return value === 'success' || value === 'cancelled' || value === 'failed'
		? value
		: null;
}

/** Only http(s) URLs are followed (Checkout / portal sessions come from the API). */
export function isHttpUrl(url: string | null | undefined): boolean {
	return /^https?:\/\/\S+$/i.test(String(url ?? ''));
}
