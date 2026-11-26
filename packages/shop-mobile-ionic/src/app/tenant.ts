import {
	ClientTenantConfig,
	resolveClientTenant,
} from '@modules/client.common.angular2/lib/tenant';
import { environment } from 'environments/environment';

/**
 * The shop's tenant (docs/multi-tenant/DESIGN.md §3.3): a white-label build's
 * `TENANT` (the branded native app), else, in the web build, the `<slug>` of a
 * `<slug>.<TENANT_BASE_DOMAIN>` page host, a `?tenant=` link or the tenant kept
 * from an earlier visit. Read at each request, so tests can change it.
 */
export function shopTenantConfig(): ClientTenantConfig {
	return {
		buildTenant: environment.TENANT,
		baseDomain: environment.TENANT_BASE_DOMAIN,
	};
}

/** graphql-ws `connectionParams`: the customer's token and the shop's tenant, read at each (re)connect. */
export function subscriptionParams(
	token: string | null
): Record<string, string> {
	const params: Record<string, string> = {};
	const tenant = resolveClientTenant(shopTenantConfig());

	if (token) {
		params.authorization = `Bearer ${token}`;
	}

	if (tenant) {
		params.tenant = tenant;
	}

	return params;
}
