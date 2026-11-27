import {
	ApolloClient,
	ApolloLink,
	CombinedGraphQLErrors,
	HttpLink,
	InMemoryCache,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { config } from '../config';
import { shopTenant, tenantHeaders } from '../utilities/tenant';

/** Logs GraphQL and network errors, like the shop did with apollo-link-error. */
export const errorLink = new ErrorLink(({ error }) => {
	if (CombinedGraphQLErrors.is(error)) {
		error.errors.forEach(({ message, locations, path }) =>
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
					locations,
				)}, Path: ${path}`,
			),
		);
	} else {
		console.log(`[Network error]: ${error}`);
	}
});

/**
 * Sends the shop's tenant as `Tenant-Id` (docs/multi-tenant/DESIGN.md §3.3). Read
 * for every request, so the page host and a ?tenant= link apply in the browser.
 */
export function tenantLink(getTenant: () => string | null = shopTenant) {
	return new SetContextLink((prevContext) => ({
		headers: { ...prevContext.headers, ...tenantHeaders(getTenant()) },
	}));
}

export function createClient(
	uri: string = config.gqlEndpoint,
	getTenant: () => string | null = shopTenant,
): ApolloClient {
	return new ApolloClient({
		// Gatsby renders the pages at build time: no API calls there, the browser fetches
		ssrMode: typeof window === 'undefined',
		link: ApolloLink.from([
			errorLink,
			tenantLink(getTenant),
			new HttpLink({ uri }),
		]),
		cache: new InMemoryCache(),
	});
}

export const client = createClient();

export default client;
