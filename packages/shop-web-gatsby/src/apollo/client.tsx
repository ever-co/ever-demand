import {
	ApolloClient,
	ApolloLink,
	HttpLink,
	InMemoryCache,
} from 'apollo-boost';
import { onError } from 'apollo-link-error';
import fetch from 'isomorphic-fetch';
// @ts-ignore
// @ts-ignore
export const client = new ApolloClient({
	uri: process.env.GQL_ENDPOINT,
	link: ApolloLink.from([
		onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors)
				graphQLErrors.map(({ message, locations, path }) =>
					console.log(
						`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
					),
				);
			if (networkError) console.log(`[Network error]: ${networkError}`);
		}),
		new HttpLink({
			uri: process.env.GQL_ENDPOINT,
		}),
	]),
	cache: new InMemoryCache(),
	fetch,
});

export default client;
