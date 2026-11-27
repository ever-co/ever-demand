import { InjectionToken } from '@angular/core';

/**
 * Client side of tenant resolution (docs/multi-tenant/DESIGN.md §3.3). Every
 * app finds its tenant the same way and sends it to the API, which applies
 * its own precedence (a login token always wins):
 *
 * 1. a build-time tenant (white-label build: `environment.TENANT`);
 * 2. the `<slug>` of a `<slug>.<TENANT_BASE_DOMAIN>` page host;
 * 3. a `?tenant=<slug>` query (kept in localStorage, for dev and links);
 * 4. the tenant kept from an earlier visit.
 */

/** HTTP header the API reads the tenant from (GraphQL and REST). */
export const TENANT_HEADER = 'Tenant-Id';

/** localStorage key of the tenant picked by a `?tenant=` link. */
export const TENANT_STORAGE_KEY = 'tenant';

export interface ClientTenantConfig {
	/** Build-time tenant slug or id (white-label builds); '' or undefined = none */
	buildTenant?: string | null;
	/** Parent domain of tenant hosts, e.g. everdemand.co; '' = not used */
	baseDomain?: string | null;
	/**
	 * Only the build-time tenant and the host count, not a `?tenant=` query
	 * or a kept tenant: for apps whose tenant comes from the login (the admin
	 * app), where a stray `?tenant=` would name another tenant than the token.
	 */
	buildOnly?: boolean;
}

const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const OBJECT_ID = /^[0-9a-f]{24}$/i;
const PLATFORM_HOSTS = new Set(['app', 'api', 'www', 'admin']);

function isTenantKey(value: string | null | undefined): value is string {
	return !!value && (SLUG.test(value) || OBJECT_ID.test(value));
}

/** `<slug>` of `<slug>.<baseDomain>` (one label, not a platform host), else null. */
export function tenantFromHost(hostname: string, baseDomain: string | null | undefined): string | null {
	const host = String(hostname ?? '').toLowerCase().replace(/\.$/, '');
	const base = String(baseDomain ?? '').toLowerCase().replace(/^\./, '').replace(/\.$/, '');

	if (!host || !base || !host.endsWith(`.${base}`)) {
		return null;
	}

	const label = host.slice(0, -(base.length + 1));

	if (label.includes('.') || PLATFORM_HOSTS.has(label) || !SLUG.test(label)) {
		return null;
	}

	return label;
}

interface LocationLike {
	hostname: string;
	search: string;
}

interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

function safeStorage(): StorageLike | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

/** The tenant this app runs for, or null (then the API decides, e.g. from a login token). */
export function resolveClientTenant(
	config: ClientTenantConfig,
	location: LocationLike | null = typeof window === 'undefined' ? null : window.location,
	storage: StorageLike | null = safeStorage()
): string | null {
	const build = String(config?.buildTenant ?? '').trim().toLowerCase();

	if (isTenantKey(build)) {
		return build;
	}

	const fromHost = location ? tenantFromHost(location.hostname, config?.baseDomain) : null;

	if (fromHost) {
		return fromHost;
	}

	if (config?.buildOnly) {
		return null;
	}

	if (location?.search) {
		const fromQuery = new URLSearchParams(location.search).get('tenant')?.trim().toLowerCase();

		if (isTenantKey(fromQuery)) {
			storage?.setItem(TENANT_STORAGE_KEY, fromQuery);
			return fromQuery;
		}
	}

	const kept = storage?.getItem(TENANT_STORAGE_KEY)?.trim().toLowerCase();

	return isTenantKey(kept) ? kept : null;
}

/** What a socket sends in its handshake `auth` (tenant and/or login token). */
export interface SocketAuth {
	tenant?: string;
	token?: string;
}

/**
 * Provider of the socket handshake `auth`: called at every (re)connection,
 * so a login or a tenant switch takes effect on the next connect (see
 * RoutersService.reconnectAll). Apps provide it with their tenant and token.
 */
export const SOCKET_AUTH = new InjectionToken<() => SocketAuth>('socket_auth');

/**
 * A SOCKET_AUTH provider from a tenant config and a localStorage token key.
 * With a login token only the token is sent (its tenant wins on the server,
 * and a kept `?tenant=` of another tenant would make the handshake fail),
 * unless `tenantWithToken` (the admin app's super-admin switch).
 */
export function socketAuthFrom(
	config: ClientTenantConfig,
	tokenStorageKey: string | null = 'token',
	tenantWithToken = false
): () => SocketAuth {
	return () => {
		const auth: SocketAuth = {};
		const token = tokenStorageKey ? safeStorage()?.getItem(tokenStorageKey) : null;
		const tenant = !token || tenantWithToken ? resolveClientTenant(config) : null;

		if (tenant) {
			auth.tenant = tenant;
		}

		if (token) {
			auth.token = token;
		}

		return auth;
	};
}

/**
 * The tenant an app with logins (merchant, carrier) names in a request:
 * only before login. Their logins are unique across tenants and the login
 * token carries the tenant (DESIGN.md §3.5); the token always wins at the
 * API, which refuses (403) a header naming another tenant than the token's,
 * so a logged-in app names none.
 */
export function tenantBeforeLogin(
	config: ClientTenantConfig,
	tokenStorageKey = 'token'
): string | null {
	return safeStorage()?.getItem(tokenStorageKey) ? null : resolveClientTenant(config);
}

/** `Tenant-Id` header of a request before login (see tenantBeforeLogin), else none. */
export function tenantHeadersBeforeLogin(
	config: ClientTenantConfig,
	tokenStorageKey = 'token'
): Record<string, string> {
	const tenant = tenantBeforeLogin(config, tokenStorageKey);
	return tenant ? { [TENANT_HEADER]: tenant } : {};
}

/** graphql-ws `connectionParams`: the login token, and the tenant before login. */
export function subscriptionConnectionParams(
	config: ClientTenantConfig,
	tokenStorageKey = 'token'
): Record<string, string> {
	const token = safeStorage()?.getItem(tokenStorageKey);
	const authorization = token ? `Bearer ${token}` : '';
	const tenant = tenantBeforeLogin(config, tokenStorageKey);

	return tenant ? { authorization, tenant } : { authorization };
}

/** Headers for an HTTP / GraphQL request: `Tenant-Id` when the app knows its tenant. */
export function tenantHeaders(config: ClientTenantConfig): Record<string, string> {
	const tenant = resolveClientTenant(config);
	return tenant ? { [TENANT_HEADER]: tenant } : {};
}
