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
		}
	}
}

function authorization(): string {
	// get the authentication token from local storage if it exists
	const token = localStorage.getItem('token');
	return token ? `Bearer ${token}` : '';
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
			authorization: authorization(),
		},
	}));

	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			lazy: true,
			connectionParams: () => ({ authorization: authorization() }),
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
