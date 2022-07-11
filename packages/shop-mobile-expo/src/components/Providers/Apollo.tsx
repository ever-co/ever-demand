import React from 'react';
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider as Provider,
} from '@apollo/client';

// ENVIRONMENT
import ENV from '../../environments/environment';

// COMPONENTS
import { ModalConnectHost } from '../Common';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}

const ApolloProvider: React.FC<Props> = (props) => {
	// STATES
	const [serverHost, setServerHost] = React.useState<string | null>(null);
	const [showDialogUriConf, setShowDialogUriConf] = React.useState<boolean>(
		!ENV.PRODUCTION || __DEV__,
	);
	// CONFIG
	const APOLLO_CLIENT = new ApolloClient({
		uri: serverHost || ENV.ENDPOINT.GQL,
		cache: new InMemoryCache(),
		defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
	});

	return (
		<Provider client={APOLLO_CLIENT}>
			<ModalConnectHost
				visible={showDialogUriConf}
				onDismiss={() => setShowDialogUriConf(false)}
				onSuccessConnect={(host) => {
					setServerHost(host);
					setShowDialogUriConf(false);
				}}
			/>
			{props.children}
		</Provider>
	);
};

export default ApolloProvider;
