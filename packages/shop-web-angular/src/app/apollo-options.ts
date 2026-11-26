import { inject } from '@angular/core';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { HttpLink } from 'apollo-angular/http';
import { OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
import {
	ClientTenantConfig,
	resolveClientTenant,
	tenantHeaders,
} from '@modules/client.common.angular2/lib/tenant';
import { environment } from 'environments/environment';
import { Store } from './services/store';

declare module '@apollo/client' {
	export namespace ApolloClient {
		export namespace DeclareDefaultOptions {
			interface WatchQuery {
				errorPolicy: 'ignore';
			}
			interface Query {
				errorPolicy: 'all';
			}
			interface Mutate {
				errorPolicy: 'all';
			}
		}
	}
}

/**
 * The shop's tenant (docs/multi-tenant/DESIGN.md §3.3): a white-label build's
 * `TENANT`, else the `<slug>` of a `<slug>.<TENANT_BASE_DOMAIN>` page host, else a
 * `?tenant=` link or the tenant kept from an earlier visit. Read at each request.
 */
export function shopTenantConfig(): ClientTenantConfig {
	return {
		buildTenant: environment.TENANT,
		baseDomain: environment.TENANT_BASE_DOMAIN,
	};
}

/**
 * Apollo client for the shop: queries and mutations over HTTP (`GQL_ENDPOINT`),
 * subscriptions over graphql-ws (`GQL_SUBSCRIPTIONS_ENDPOINT`). The WebSocket is lazy,
 * it only opens when the first subscription starts. Customers belong to one
 * tenant, so every request names the shop's tenant (`Tenant-Id` header,
 * `tenant` connection param) when the shop knows it.
 */
export function createApolloOptions(): ApolloClient.Options {
	const httpLink = inject(HttpLink);
	const store = inject(Store);

	const authLink = new SetContextLink((prevContext) => {
		// get the authentication token from local storage if it exists
		const token = store.token;
		const headers: Record<string, string> = {
			...tenantHeaders(shopTenantConfig()),
			...(token ? { authorization: `Bearer ${token}` } : {}),
		};

		return Object.keys(headers).length > 0
			? { headers: { ...prevContext.headers, ...headers } }
			: {};
	});

	const http = authLink.concat(
		httpLink.create({ uri: environment.GQL_ENDPOINT })
	);

	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			lazy: true,
			connectionParams: () => subscriptionParams(store.token),
		})
	);

	const link = ApolloLink.split(
		({ operationType }) =>
			operationType === OperationTypeNode.SUBSCRIPTION,
		ws,
		http
	);

	return {
		link,
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'network-only',
				errorPolicy: 'ignore',
			},
			query: {
				fetchPolicy: 'network-only',
				errorPolicy: 'all',
			},
			mutate: {
				errorPolicy: 'all',
			},
		},
		cache: new InMemoryCache(),
	};
}

/** graphql-ws `connectionParams`: the customer's token and the shop's tenant, read at each (re)connect. */
export function subscriptionParams(token: string | null): Record<string, string> {
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
