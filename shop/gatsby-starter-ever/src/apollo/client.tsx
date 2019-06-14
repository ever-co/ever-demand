import fetch from 'isomorphic-fetch';
import {
	ApolloClient,
	HttpLink,
	InMemoryCache,
	ApolloLink,
} from 'apollo-boost';
import config from '../config';
import { onError } from 'apollo-link-error';
// @ts-ignore
// @ts-ignore
export const client = new ApolloClient({
	uri: config.graphqlUri,
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
			uri: config.graphqlUri,
		}),
	]),
	cache: new InMemoryCache(),
	fetch,
});

export default client;
