/**
 * Apollo Client 4, set up like the Ionic app's `_setupApolloAngular`: subscriptions go over
 * graphql-ws, everything else over HTTP, with an `authorization` header from the stored token and
 * the shop's tenant (config/tenant.ts) as `Tenant-Id` / graphql-ws `connectionParams.tenant`.
 */
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { isSubscriptionOperation } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { TENANT_HEADER, tenantToSend } from '../config/tenant';

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
	/** The shop's tenant, read for every request and every (re)connect; null = none sent. */
	getTenant?: () => string | null;
	/** fetch of the HTTP link (tests). */
	fetch?: typeof fetch;
}

/** graphql-ws `connection_init` payload: `authorization` with a token, `tenant` when known. */
export function wsConnectionParams(token: string | null, tenant: string | null): Record<string, string> {
	const params: Record<string, string> = {};
	const sent = tenantToSend(tenant, token);

	if (token) {
		params.authorization = `Bearer ${token}`;
	}

	if (sent) {
		params.tenant = sent;
	}

	return params;
}

export function createApolloClient({
	httpEndpoint,
	subscriptionsEndpoint,
	getToken = () => null,
	getTenant = () => null,
	fetch: fetchImpl,
}: GraphQLClientOptions): ApolloClient {
	const http = new HttpLink({ uri: httpEndpoint, ...(fetchImpl ? { fetch: fetchImpl } : {}) });

	// lazy: the socket opens with the first subscription (the shop has none today). The params are
	// read again at every (re)connect.
	const ws = new GraphQLWsLink(
		createClient({
			url: subscriptionsEndpoint,
			lazy: true,
			connectionParams: () => wsConnectionParams(getToken(), getTenant()),
		}),
	);

	const auth = new SetContextLink((prevContext) => {
		const token = getToken();
		const tenant = tenantToSend(getTenant(), token);
		return {
			headers: {
				...prevContext.headers,
				authorization: token ? `Bearer ${token}` : '',
				...(tenant ? { [TENANT_HEADER]: tenant } : {}),
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
