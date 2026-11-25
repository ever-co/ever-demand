import { inject } from '@angular/core';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { HttpLink } from 'apollo-angular/http';
import { OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
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
 * Apollo client for the shop: queries and mutations over HTTP (`GQL_ENDPOINT`),
 * subscriptions over graphql-ws (`GQL_SUBSCRIPTIONS_ENDPOINT`). The WebSocket is lazy,
 * it only opens when the first subscription starts.
 */
export function createApolloOptions(): ApolloClient.Options {
	const httpLink = inject(HttpLink);
	const store = inject(Store);

	const authLink = new SetContextLink((prevContext) => {
		// get the authentication token from local storage if it exists
		const token = store.token;
		return token
			? {
					headers: {
						...prevContext.headers,
						authorization: `Bearer ${token}`,
					},
			  }
			: {};
	});

	const http = authLink.concat(
		httpLink.create({ uri: environment.GQL_ENDPOINT })
	);

	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			lazy: true,
			connectionParams: () =>
				store.token ? { authorization: `Bearer ${store.token}` } : {},
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
