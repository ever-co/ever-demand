/**
 * Client side of tenant resolution (docs/multi-tenant/DESIGN.md §3.3), the Expo port of
 * `packages/common-angular/src/lib/tenant.ts`. One API serves many tenants (businesses), so the
 * shop always tells it which one it is for. The first match wins:
 *
 * 1. the build-time tenant (white-label build: `EXPO_PUBLIC_TENANT`, a slug or a 24-hex id);
 * 2. web build: the `<slug>` of a `<slug>.<EXPO_PUBLIC_TENANT_BASE_DOMAIN>` page host;
 * 3. web build: a `?tenant=<slug>` query (kept in localStorage, for dev and links);
 * 4. web build: the tenant kept from an earlier visit.
 *
 * Native builds have no page host or query: only the build-time tenant applies there. With no
 * tenant at all nothing is sent and the API decides (single-tenant installs use their default).
 */

/** HTTP header the API reads the tenant from (GraphQL and REST). */
export const TENANT_HEADER = 'Tenant-Id';

/** localStorage key of the tenant picked by a `?tenant=` link (the same as the Angular apps). */
export const TENANT_STORAGE_KEY = 'tenant';

export interface ClientTenantConfig {
	/** Build-time tenant slug or id (white-label builds); '' or undefined = none */
	buildTenant?: string | null;
	/** Parent domain of tenant hosts, e.g. everdemand.co; '' = not used */
	baseDomain?: string | null;
}

export interface LocationLike {
	hostname: string;
	search: string;
}

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

const SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const OBJECT_ID = /^[0-9a-f]{24}$/i;
const PLATFORM_HOSTS = new Set(['app', 'api', 'www', 'admin']);

/** A tenant slug or a 24-hex tenant id. */
export function isTenantKey(value: string | null | undefined): value is string {
	return !!value && (SLUG.test(value) || OBJECT_ID.test(value));
}

/** `<slug>` of `<slug>.<baseDomain>` (one label, not a platform host), else null. */
export function tenantFromHost(
	hostname: string,
	baseDomain: string | null | undefined,
): string | null {
	const host = String(hostname ?? '')
		.toLowerCase()
		.replace(/\.$/, '');
	const base = String(baseDomain ?? '')
		.toLowerCase()
		.replace(/^\./, '')
		.replace(/\.$/, '');

	if (!host || !base || !host.endsWith(`.${base}`)) {
		return null;
	}

	const label = host.slice(0, -(base.length + 1));

	if (label.includes('.') || PLATFORM_HOSTS.has(label) || !SLUG.test(label)) {
		return null;
	}

	return label;
}

/** The page location on the web build; null on native (React Native has no `location`). */
export function webLocation(): LocationLike | null {
	try {
		const location = (globalThis as { location?: Partial<LocationLike> })
			.location;
		return location && typeof location.hostname === 'string'
			? {
					hostname: location.hostname,
					search:
						typeof location.search === 'string'
							? location.search
							: '',
				}
			: null;
	} catch {
		return null;
	}
}

/** localStorage on the web build; null on native or when the browser blocks it. */
export function webStorage(): StorageLike | null {
	try {
		const storage = (globalThis as { localStorage?: StorageLike })
			.localStorage;
		return storage && typeof storage.getItem === 'function'
			? storage
			: null;
	} catch {
		return null;
	}
}

function queryTenant(search: string): string | null {
	const match = /[?&]tenant=([^&#]*)/.exec(search);
	if (!match) {
		return null;
	}
	try {
		return decodeURIComponent(match[1].replace(/\+/g, ' '))
			.trim()
			.toLowerCase();
	} catch {
		return null;
	}
}

/** The tenant this shop runs for, or null (then the API decides). */
export function resolveClientTenant(
	config: ClientTenantConfig,
	location: LocationLike | null = webLocation(),
	storage: StorageLike | null = webStorage(),
): string | null {
	const build = String(config?.buildTenant ?? '')
		.trim()
		.toLowerCase();

	if (isTenantKey(build)) {
		return build;
	}

	const fromHost = location
		? tenantFromHost(location.hostname, config?.baseDomain)
		: null;

	if (fromHost) {
		return fromHost;
	}

	const fromQuery = location?.search ? queryTenant(location.search) : null;

	if (isTenantKey(fromQuery)) {
		try {
			storage?.setItem(TENANT_STORAGE_KEY, fromQuery);
		} catch {
			// private mode or a full quota: the query still applies to this page
		}
		return fromQuery;
	}

	let kept: string | null | undefined = null;
	try {
		kept = storage?.getItem(TENANT_STORAGE_KEY)?.trim().toLowerCase();
	} catch {
		kept = null;
	}

	return isTenantKey(kept) ? kept : null;
}

/**
 * The `tenantId` claim of a login token (read, not verified: the API verifies it), or null when
 * the token has none (tokens issued before tenants existed belong to the default tenant).
 */
export function tokenTenantId(token: string | null | undefined): string | null {
	const payload = String(token ?? '')
		.replace(/^bearer\s+/i, '')
		.split('.')[1];
	const atob = (globalThis as { atob?: (data: string) => string }).atob;

	if (!payload || !atob) {
		return null;
	}

	try {
		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const claims = JSON.parse(
			atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4)),
		);
		return typeof claims?.tenantId === 'string' &&
			isTenantKey(claims.tenantId)
			? claims.tenantId
			: null;
	} catch {
		return null;
	}
}

/**
 * The tenant to send next to a login token. A token carries its tenant and wins on the server,
 * which refuses (403) a `Tenant-Id` naming another one: with a token, send the token's own tenant
 * (or none for an old token without the claim), never the resolved one.
 */
export function tenantToSend(
	tenant: string | null,
	token: string | null | undefined,
): string | null {
	return token ? tokenTenantId(token) : tenant;
}

/** What a socket sends in its handshake `auth` (tenant and/or login token). */
export interface SocketAuth {
	tenant?: string;
	token?: string;
}

/** The socket.io handshake `auth` of the current tenant and token. */
export function socketAuth(
	tenant: string | null,
	token: string | null = null,
): SocketAuth {
	const auth: SocketAuth = {};
	const sent = tenantToSend(tenant, token);

	if (sent) {
		auth.tenant = sent;
	}

	if (token) {
		auth.token = token;
	}

	return auth;
}
