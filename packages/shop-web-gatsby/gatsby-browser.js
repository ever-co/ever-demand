import React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import { client } from './src/apollo/client';
import { Provider } from './src/Context';
// import './src/styles/styles.module.scss'
export const wrapRootElement = ({ element }) => {
	return (
		<Provider>
			<ApolloProvider client={client}>{element}</ApolloProvider>
		</Provider>
	);
};
