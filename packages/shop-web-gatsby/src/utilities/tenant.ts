/**
 * Client side of tenant resolution (docs/multi-tenant/DESIGN.md §3.3), the Gatsby
 * port of `packages/common-angular/src/lib/tenant.ts`. One API serves many tenants
 * (businesses), so the shop always tells it which one it is for. The first match
 * wins:
 *
 * 1. the build-time tenant (white-label build: `GATSBY_TENANT`, a slug or a 24-hex id);
 * 2. the `<slug>` of a `<slug>.<GATSBY_TENANT_BASE_DOMAIN>` page host, read at runtime;
 * 3. a `?tenant=<slug>` query (kept in localStorage, for dev and links);
 * 4. the tenant kept from an earlier visit.
 *
 * With none, nothing is sent and the API decides (single-tenant installs use their
 * default tenant). At build time (SSR) only the build-time tenant applies.
 */
import { config } from '../config';

/** HTTP header the API reads the tenant from (GraphQL and REST). */
export const TENANT_HEADER = 'Tenant-Id';

/** localStorage key of the tenant picked by a `?tenant=` link. */
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

function browserLocation(): LocationLike | null {
  return typeof window === 'undefined' ? null : window.location;
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The tenant this shop runs for, or null (then the API decides). */
export function resolveClientTenant(
  tenantConfig: ClientTenantConfig,
  location: LocationLike | null = browserLocation(),
  storage: StorageLike | null = browserStorage(),
): string | null {
  const build = String(tenantConfig?.buildTenant ?? '')
    .trim()
    .toLowerCase();

  if (isTenantKey(build)) {
    return build;
  }

  const fromHost = location
    ? tenantFromHost(location.hostname, tenantConfig?.baseDomain)
    : null;

  if (fromHost) {
    return fromHost;
  }

  if (location?.search) {
    const fromQuery = new URLSearchParams(location.search)
      .get('tenant')
      ?.trim()
      .toLowerCase();

    if (isTenantKey(fromQuery)) {
      try {
        storage?.setItem(TENANT_STORAGE_KEY, fromQuery);
      } catch {
        // private mode or a full quota: the query still applies to this page
      }
      return fromQuery;
    }
  }

  let kept: string | undefined;
  try {
    kept = storage?.getItem(TENANT_STORAGE_KEY)?.trim().toLowerCase();
  } catch {
    kept = undefined;
  }

  return isTenantKey(kept) ? kept : null;
}

/** This shop's tenant, from GATSBY_TENANT / GATSBY_TENANT_BASE_DOMAIN and the page. */
export function shopTenant(): string | null {
  return resolveClientTenant({
    buildTenant: config.tenant,
    baseDomain: config.tenantBaseDomain,
  });
}

/** Headers for an API request: `Tenant-Id` when the shop knows its tenant. */
export function tenantHeaders(
  tenant: string | null = shopTenant(),
): Record<string, string> {
  return tenant ? { [TENANT_HEADER]: tenant } : {};
}
