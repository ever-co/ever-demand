import {
	ApolloClient,
	ApolloLink,
	CombinedGraphQLErrors,
	HttpLink,
	InMemoryCache,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { config } from '../config';

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

export function createClient(uri: string = config.gqlEndpoint): ApolloClient {
	return new ApolloClient({
		// Gatsby renders the pages at build time: no API calls there, the browser fetches
		ssrMode: typeof window === 'undefined',
		link: ApolloLink.from([errorLink, new HttpLink({ uri })]),
		cache: new InMemoryCache(),
	});
}

export const client = createClient();

export default client;
