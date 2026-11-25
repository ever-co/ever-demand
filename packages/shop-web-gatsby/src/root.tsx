import React, { type ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './apollo/client';
import { Provider } from './Context';

/** Root of every page (gatsby-browser and gatsby-ssr): app context and Apollo client. */
export const wrapRootElement = ({ element }: { element: ReactNode }) => (
	<Provider>
		<ApolloProvider client={client}>{element}</ApolloProvider>
	</Provider>
);
