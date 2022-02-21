import React from 'react';
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider as Provider,
} from '@apollo/client';

// ENVIRONMENT
import ENV from '../../environments/environment';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}

const ApolloProvider: React.FC<Props> = (props) => {
	// CONFIG
	const APOLLO_CLIENT = new ApolloClient({
		uri: ENV.ENDPOINT.GQL,
		cache: new InMemoryCache(),
		defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
	});

	return <Provider client={APOLLO_CLIENT}>{props.children}</Provider>;
};

export default ApolloProvider;
