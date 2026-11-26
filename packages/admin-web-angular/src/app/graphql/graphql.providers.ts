import { inject, Injectable, Provider } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getOperationAST, type DocumentNode } from 'graphql';
import { createClient, type Client } from 'graphql-ws';
import { TENANT_HEADER } from '@modules/client.common.angular2/lib/tenant';
import { environment } from 'environments/environment';
import { Store } from '../@core/data/store.service';

// Apollo Client 4 types the results from the default errorPolicy, so non-default defaults have to
// be declared (https://www.apollographql.com/docs/react/data/typescript#declaring-default-options).
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

/** `true` for subscription operations, which go over graphql-ws instead of HTTP. */
export function isSubscription(
	query: DocumentNode,
	operationName?: string,
): boolean {
	const definition = getOperationAST(query, operationName);
	return !!definition && definition.operation === 'subscription';
}

/** Adds `Authorization: Bearer <token>` from the store to every operation. */
export function createAuthLink(
	getToken: () => string | null | undefined,
): ApolloLink {
	return new SetContextLink((prevContext) => {
		const token = getToken();
		return {
			headers: {
				...prevContext.headers,
				authorization: token ? `Bearer ${token}` : '',
			},
		};
	});
}

/**
 * Operation context flag: the operation is about the logged-in admin itself
 * (its own record, profile, password), so it goes to the admin's own tenant
 * even while a super-admin acts in another one.
 */
export const OWN_TENANT_CONTEXT = { ownTenant: true } as const;

/**
 * Adds `Tenant-Id: <slug>` to every operation while a platform super-admin
 * has switched tenant (`getTenant` returns the slug). Otherwise nothing is
 * added: the API takes the tenant from the login token, and answers 403 to
 * a normal admin naming another tenant.
 */
export function createTenantLink(
	getTenant: () => string | null | undefined,
): ApolloLink {
	return new SetContextLink((prevContext) => {
		const tenant = prevContext.ownTenant ? null : getTenant();

		if (!tenant) {
			return {};
		}

		return {
			headers: {
				...prevContext.headers,
				[TENANT_HEADER]: tenant,
			},
		};
	});
}

/** The graphql-ws payload of `connection_init`: login token and switched tenant. */
export function wsConnectionParams(
	getToken: () => string | null | undefined,
	getTenant: () => string | null | undefined,
): Record<string, string> {
	const params: Record<string, string> = {};
	const token = getToken();
	const tenant = getTenant();

	if (token) {
		params.authorization = `Bearer ${token}`;
	}

	if (tenant) {
		params.tenant = tenant;
	}

	return params;
}

/**
 * The graphql-ws client of the app. A WebSocket names its tenant once, when it
 * connects: `restart()` reconnects it (and its live subscriptions) after a
 * login, a logout or a tenant switch.
 */
@Injectable({ providedIn: 'root' })
export class GraphQLWsClientRef {
	client?: Client;

	restart() {
		this.client?.terminate();
	}
}

/** Same defaults as the Apollo 2 / 3 setup the screens were written for. */
export const DEFAULT_OPTIONS: NonNullable<
	ApolloClient.Options['defaultOptions']
> = {
	watchQuery: {
		fetchPolicy: 'network-only',
		errorPolicy: 'ignore',
		// Apollo 4 turned this on by default, which emits a `{ loading: true, data: undefined }`
		// result first; the services map `res.data` straight away.
		notifyOnNetworkStatusChange: false,
	},
	query: {
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	},
	mutate: {
		errorPolicy: 'all',
	},
};

export function createApolloOptions(
	httpLink: HttpLink,
	getToken: () => string | null | undefined,
	getTenant: () => string | null | undefined = () => null,
	wsRef?: GraphQLWsClientRef,
): ApolloClient.Options {
	const http = httpLink.create({ uri: environment.GQL_ENDPOINT });

	// graphql-ws replaces the dead subscriptions-transport-ws (`WebSocketLink`).
	// Lazy: the socket opens with the first subscription, so screens without one never connect.
	const wsClient = createClient({
		url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
		lazy: true,
		retryAttempts: Infinity,
		shouldRetry: () => true,
		connectionParams: () => wsConnectionParams(getToken, getTenant),
	});

	if (wsRef) {
		wsRef.client = wsClient;
	}

	const ws = new GraphQLWsLink(wsClient);

	return {
		link: ApolloLink.from([
			createAuthLink(getToken),
			createTenantLink(getTenant),
			ApolloLink.split(
				({ query, operationName }) =>
					isSubscription(query, operationName),
				ws,
				http,
			),
		]),
		cache: new InMemoryCache(),
		defaultOptions: DEFAULT_OPTIONS,
	};
}

export function provideGraphQL(): Provider {
	return provideApollo(() => {
		const store = inject(Store);
		return createApolloOptions(
			inject(HttpLink),
			() => store.token,
			// only a super-admin's switch names a tenant (Store.switchedTenant)
			() => store.switchedTenant,
			inject(GraphQLWsClientRef),
		);
	});
}
