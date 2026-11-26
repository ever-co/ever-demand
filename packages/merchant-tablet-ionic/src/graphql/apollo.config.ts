import { inject, NgModule } from '@angular/core';
import {
	provideHttpClient,
	withInterceptorsFromDi,
	withXhr,
} from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
import {
	ClientTenantConfig,
	resolveClientTenant,
	TENANT_HEADER,
} from '@modules/client.common.angular2/lib/tenant';
import { environment } from '../environments/environment';

// Apollo Client 4 types the results by the default error policies, so they are declared here.
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

function authorization(): string {
	// get the authentication token from local storage if it exists
	const token = localStorage.getItem('token');
	return token ? `Bearer ${token}` : '';
}

/**
 * Tenant settings of this build (docs/multi-tenant/DESIGN.md §3.3): a white-label
 * `TENANT`, else the `<slug>` of a `<slug>.<TENANT_BASE_DOMAIN>` page host, else a
 * `?tenant=` link or the tenant kept from an earlier visit. Read at each request.
 */
export function appTenantConfig(): ClientTenantConfig {
	return {
		buildTenant: environment.TENANT,
		baseDomain: environment.TENANT_BASE_DOMAIN,
	};
}

/**
 * The tenant to name in a request: only before login. Store logins are unique
 * across tenants and the login token carries the tenant (DESIGN.md §3.5); the
 * token always wins at the API, which refuses (403) a header naming another
 * tenant than the token's, so a logged-in app names none.
 */
function tenantBeforeLogin(): string | null {
	return localStorage.getItem('token')
		? null
		: resolveClientTenant(appTenantConfig());
}

function tenantHeader(): Record<string, string> {
	const tenant = tenantBeforeLogin();
	return tenant ? { [TENANT_HEADER]: tenant } : {};
}

/** graphql-ws `connectionParams`, read at each (re)connect. */
export function subscriptionParams(): Record<string, string> {
	const tenant = tenantBeforeLogin();
	return tenant
		? { authorization: authorization(), tenant }
		: { authorization: authorization() };
}

/**
 * Apollo Client 4 options: HTTP for queries and mutations, graphql-ws for subscriptions
 * (`subscriptions-transport-ws` is dead). The WebSocket only opens when a subscription runs.
 */
export function createApolloOptions(httpLink: HttpLink): ApolloClient.Options {
	const http = httpLink.create({ uri: environment.GQL_ENDPOINT });

	const auth = new SetContextLink((prevContext) => ({
		headers: {
			...prevContext.headers,
			...tenantHeader(),
			authorization: authorization(),
		},
	}));

	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			lazy: true,
			connectionParams: subscriptionParams,
		}),
	);

	const link = ApolloLink.split(
		(operation) =>
			operation.operationType === OperationTypeNode.SUBSCRIPTION,
		ws,
		auth.concat(http),
	);

	return {
		link,
		cache: new InMemoryCache(),
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'network-only',
				errorPolicy: 'ignore',
				// Apollo 3 behaviour: no extra "loading" emissions on polls and refetches.
				notifyOnNetworkStatusChange: false,
			},
			query: {
				fetchPolicy: 'network-only',
				errorPolicy: 'all',
			},
			mutate: {
				errorPolicy: 'all',
			},
		},
	};
}

@NgModule({
	providers: [
		provideHttpClient(withXhr(), withInterceptorsFromDi()),
		provideApollo(() => createApolloOptions(inject(HttpLink))),
	],
})
export class GraphQLModule {}
