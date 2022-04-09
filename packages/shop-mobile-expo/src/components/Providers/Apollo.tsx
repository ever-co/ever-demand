import React from 'react';
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider as Provider,
} from '@apollo/client';
import {
	Text,
	TextInput,
	Button,
	View,
	Modal,
	ActivityIndicator,
} from 'react-native';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// ENVIRONMENT
import ENV from '../../environments/environment';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

// LOCAL TYPES
export interface Props {
	children: React.ReactElement<any>;
}

const ApolloProvider: React.FC<Props> = (props) => {
	// STATES
	const [serverHostInp, setServerHostInp] = React.useState<string>('');
	const [serverHost, setServerHost] = React.useState<string | null>(null);
	const [showDialogUriConf, setShowDialogUriConf] = React.useState<boolean>(
		ENV.PRODUCTION || __DEV__,
	);
	const [serverHostInpMsg, setServerHostInpMsg] = React.useState<string>('');
	const [serverHostLoading] = React.useState<boolean>(false);

	// FUNCTIONS
	const onConfirmHost = async () => {
		setServerHostInpMsg('');
		if (isEmpty(serverHostInp)) {
			return setServerHostInpMsg("Can't be empty");
		}

		const FORMATTED_URI = `http://${serverHostInp}/graphql`;
		// setServerHostLoading(true);

		// if (!(await serverReachable(serverHostInp))) {
		// 	return setServerHostInpMsg("Can't connect on this host");
		// }

		setServerHost(FORMATTED_URI);
		setShowDialogUriConf(false);
	};

	const onCancelHost = () => {
		setServerHost(null);
		setShowDialogUriConf(false);
	};

	// CONFIG
	const APOLLO_CLIENT = new ApolloClient({
		uri: ENV.ENDPOINT.GQL,
		cache: new InMemoryCache(),
		defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
	});

	return (
		<Provider client={APOLLO_CLIENT}>
			<Modal
				visible={showDialogUriConf}
				onDismiss={function (): void {}}
				style={{ ...GS.bgTransparent }}
				transparent>
				<View
					style={{
						...GS.flex1,
						...GS.centered,
						...GS.px4,
					}}>
					<View
						style={{
							...GS.bgLight,
							...GS.py5,
							...GS.px4,
							...GS.w100,
							...GS.rounded,
							...GS.shadowLg,
							...GS.centered,
						}}>
						<Text style={{ ...GS.txtPrimary, ...GS.txtCenter }}>
							{`You're running the this application in development mode
					\nWe're not able to determinate the Api Host that you use.
					\nIf you're on "${ENV.ENDPOINT.GQL}", you can just cancel otherwise you've to specify your host`}
						</Text>

						<View style={{ ...GS.w100, ...GS.my4 }}>
							<TextInput
								value={serverHostInp}
								placeholder='Ex: 10.0.2.2:8443'
								onChangeText={(text) => {
									setServerHostInp(text);
								}}
								style={{
									...GS.input,
									...GS.w100,
									color: CC.primary,
								}}
							/>

							<Text
								style={{
									color: CC.danger,
								}}>
								{serverHostInpMsg}
							</Text>
						</View>

						<View style={{ ...GS.inlineItems, ...GS.mt4 }}>
							<View
								style={{
									...GS.mr2,
									...GS.flex1,
									...(serverHostLoading ? GS.centered : {}),
								}}>
								{serverHostLoading ? (
									<ActivityIndicator
										size={CS.FONT_SIZE}
										color={CC.primary}
									/>
								) : (
									<Button
										title='Confirm'
										color={CC.primary}
										onPress={onConfirmHost}
									/>
								)}
							</View>
							<View style={{ ...GS.flex1 }}>
								<Button
									title='Cancel'
									color={CC.gray}
									onPress={onCancelHost}
								/>
							</View>
						</View>
					</View>
				</View>
			</Modal>
			{props.children}
		</Provider>
	);
};

export default ApolloProvider;
