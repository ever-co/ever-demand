import type { ClientTenantConfig } from '@modules/client.common.angular2/lib/tenant';

/**
 * Tenant of the admin app's requests (docs/multi-tenant/DESIGN.md §3.3).
 *
 * The admin app runs at one address for every tenant: the login token
 * carries the tenant, so a normal admin never sends `Tenant-Id`. Only a
 * platform super-admin may act in another tenant: the slug picked in the
 * header's tenant switcher is kept here and sent as `Tenant-Id` (GraphQL)
 * and `auth.tenant` (socket.io handshake).
 */

/** localStorage key of the login token (Store.token); the socket handshake sends it too. */
export const TOKEN_STORAGE_KEY = 'token';

/** localStorage key of the tenant a super-admin switched into. */
export const SWITCHED_TENANT_KEY = '_superAdminTenant';

/** localStorage keys of the logged-in admin's tenant role and super-admin flag. */
export const ADMIN_ROLE_KEY = '_adminRole';
export const SUPER_ADMIN_KEY = '_isSuperAdmin';
export const ADMIN_TENANT_ID_KEY = '_adminTenantId';

interface StorageLike {
	getItem(key: string): string | null;
}

function safeStorage(): StorageLike | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

/**
 * The tenant every request names: the slug a super-admin switched into, else
 * null (the API takes the tenant from the login token). A slug kept from an
 * earlier super-admin session is ignored for anybody else.
 */
export function switchedTenant(storage: StorageLike | null = safeStorage()): string | null {
	if (storage?.getItem(SUPER_ADMIN_KEY) !== 'true') {
		return null;
	}

	const slug = storage.getItem(SWITCHED_TENANT_KEY)?.trim().toLowerCase();

	return slug || null;
}

/**
 * Tenant config of `CommonModule.forRoot`: read at every socket (re)connection,
 * so a switch takes effect with `RoutersService.reconnectAll()`. No base
 * domain: the admin app is not served on tenant hosts.
 */
export const ADMIN_TENANT_CONFIG: ClientTenantConfig = {
	get buildTenant(): string | null {
		return switchedTenant();
	},
	baseDomain: null,
	// never a ?tenant= query or a kept tenant: the login token decides
	buildOnly: true,
};

/**
 * Socket handshake options of the admin app for `CommonModule.forRoot`: the
 * login token, plus the tenant next to it for a super-admin's switch only
 * (ADMIN_TENANT_CONFIG names none for anybody else).
 */
export const ADMIN_SOCKET_AUTH = {
	tenant: ADMIN_TENANT_CONFIG,
	tokenStorageKey: TOKEN_STORAGE_KEY,
	tenantWithToken: true,
} as const;
