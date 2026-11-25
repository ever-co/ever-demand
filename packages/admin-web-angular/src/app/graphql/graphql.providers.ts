import { inject, Provider } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getOperationAST, type DocumentNode } from 'graphql';
import { createClient } from 'graphql-ws';
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
): ApolloClient.Options {
	const http = httpLink.create({ uri: environment.GQL_ENDPOINT });

	// graphql-ws replaces the dead subscriptions-transport-ws (`WebSocketLink`).
	// Lazy: the socket opens with the first subscription, so screens without one never connect.
	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			lazy: true,
			retryAttempts: Infinity,
			shouldRetry: () => true,
			connectionParams: () => {
				const token = getToken();
				return token ? { authorization: `Bearer ${token}` } : {};
			},
		}),
	);

	return {
		link: ApolloLink.from([
			createAuthLink(getToken),
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
		return createApolloOptions(inject(HttpLink), () => store.token);
	});
}
