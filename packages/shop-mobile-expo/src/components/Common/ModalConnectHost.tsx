import React from 'react';
import {
	Text,
	TextInput,
	View,
	Modal,
	TouchableWithoutFeedback,
	ActivityIndicator,
	Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HELPERS
import { checkServer, isEmpty } from '../../helpers/utils';

// ENVIRONMENT
import ENV from '../../environments/environment';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

export interface Props {
	visible: boolean;
	onDismiss: () => any;
	onSuccessConnect: (host: string) => any;
}

const ModalConnectHost: React.FC<Props> = ({
	visible,
	onDismiss,
	onSuccessConnect,
}) => {
	// STATES
	const [serverHostInp, setServerHostInp] = React.useState<string>('');
	const [serverHostInpMsg, setServerHostInpMsg] = React.useState<string>('');
	const [serverHostLoading, setServerHostLoading] =
		React.useState<boolean>(false);

	// REFS
	const serverHostInpRef = React.useRef<TextInput>(null);

	// FUNCTIONS
	const onConfirmHost = async () => {
		setServerHostInpMsg('');
		if (isEmpty(serverHostInp)) {
			return setServerHostInpMsg("Can't be empty");
		}

		const REG_PROTOCOL = new RegExp(/^http(s)?:\/\//);
		const FORMATTED_HOST = REG_PROTOCOL.test(serverHostInp)
			? serverHostInp
			: `https://${serverHostInp}`;
		const FORMATTED_URI = FORMATTED_HOST + '/graphql';

		AsyncStorage.setItem('serverHost', serverHostInp);
		setServerHostLoading(true);

		await checkServer(
			FORMATTED_URI,
			6000,
			() => {
				onSuccessConnect(FORMATTED_URI);
				onDismiss();
			},
			(errMsg) => {
				setServerHostInpMsg("Can't connect on this host: " + errMsg);
			},
		).finally(() => {
			setServerHostLoading(false);
		});
	};

	const onCancelHost = () => {
		onDismiss();
	};

	// EFFECTS
	React.useEffect(() => {
		(async () => {
			const LOCAL_SERVER_HOST = await AsyncStorage.getItem('serverHost');

			if (typeof LOCAL_SERVER_HOST === 'string') {
				setServerHostInp(LOCAL_SERVER_HOST);
			}
		})();
	}, []);

	return (
		<Modal
			visible={visible}
			onDismiss={onDismiss}
			style={{ ...GS.bgTransparent }}
			transparent>
			<TouchableWithoutFeedback
				onPress={() => {
					serverHostInpRef.current?.blur();
				}}>
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
								ref={serverHostInpRef}
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
			</TouchableWithoutFeedback>
		</Modal>
	);
};

export default ModalConnectHost;
