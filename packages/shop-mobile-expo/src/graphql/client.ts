/**
 * Apollo Client 4, set up like the Ionic app's `_setupApolloAngular`: subscriptions go over
 * graphql-ws, everything else over HTTP, with an `authorization` header from the stored token.
 */
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { isSubscriptionOperation } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

/** Default error policies of the Ionic client (Apollo 4 types them through this declaration). */
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

/** The Ionic default options: watch queries ignore errors, one-off queries return what resolved. */
export const DEFAULT_OPTIONS = {
	watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'ignore' },
	query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
} as const;

export interface GraphQLClientOptions {
	httpEndpoint: string;
	subscriptionsEndpoint: string;
	/** The shop never stores a token; kept so the header matches the other apps. */
	getToken?: () => string | null;
}

export function createApolloClient({
	httpEndpoint,
	subscriptionsEndpoint,
	getToken = () => null,
}: GraphQLClientOptions): ApolloClient {
	const http = new HttpLink({ uri: httpEndpoint });

	// lazy: the socket opens with the first subscription (the shop has none today).
	const ws = new GraphQLWsLink(createClient({ url: subscriptionsEndpoint, lazy: true }));

	const auth = new SetContextLink((prevContext) => {
		const token = getToken();
		return {
			headers: {
				...prevContext.headers,
				authorization: token ? `Bearer ${token}` : '',
			},
		};
	});

	return new ApolloClient({
		link: ApolloLink.from([
			auth,
			ApolloLink.split(({ query }) => isSubscriptionOperation(query), ws, http),
		]),
		cache: new InMemoryCache(),
		defaultOptions: DEFAULT_OPTIONS,
	});
}
