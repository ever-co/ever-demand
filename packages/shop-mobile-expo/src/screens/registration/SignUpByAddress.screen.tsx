import React from 'react';
import {
	View,
	StyleSheet,
	Alert,
	// Button as NativeBtn,
	// Text as NativeTxt,
} from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { showMessage } from 'react-native-flash-message';

// CONSTANTS
// import GROUPS from '../../router/groups.routes';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';
// import { setGroup } from '../../store/features/navigation';

// HELPERS
import {
	getFormattedAddress,
	FormattedAddressInterface,
} from '../../helpers/location';

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

// TYPES
export interface FormInterface {
	firstName: string;
	lastName: string;
	house: string;
	apartment: string;
}

const SignUpByAddressScreen = () => {
	// SELECTORS
	const currentLanguage = useAppSelector(getLanguage);

	// ACTIONS
	const setNavigationGroup = useAppDispatch();

	// NAVIGATIOn
	const navigation = useNavigation();

	// STATES
	const [warningDialog, setWarningDialog] = React.useState<boolean>(false);
	const [form, setForm] = React.useState<FormInterface>({
		firstName: '',
		lastName: '',
		house: '',
		apartment: '',
	});
	const [loading, setLoading] = React.useState<boolean>(true);
	const [canGoBack, setCanGoBack] = React.useState<boolean>(false);
	const [, /* preventBackCallBack */ setPreventBackCallBack] = React.useState<
		() => any
	>(() => {});
	const [currentPosition, setCurrentPosition] =
		React.useState<Location.LocationObject | null>(null);
	const [formattedAddress, setFormattedAddress] =
		React.useState<FormattedAddressInterface | null>(null);
	const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

	// DATA
	const STYLES = StyleSheet.create({
		container: {
			...GS.screen,
			...GS.bgTransparent,
			...GS.px5,
			...GS.pb5,
			...GS.mx5,
		},
		section1: {
			...GS.centered,
			...GS.py2,
			flex: 3,
		},
		section1Title: {
			...GS.txtCenter,
			...GS.mb3,
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_LG * 1.8,
		},
		section1SubTitle: {
			...GS.txtCenter,
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_MD,
			opacity: 0.6,
		},
		section2: { ...GS.py2, flex: 2, alignItems: 'center' },
		section2Title: {
			...GS.txtCenter,
			...GS.mb5,
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_SM * 2,
		},
		formContainer: {},
		formInput: {},
	});

	// EFFECTS
	React.useEffect(() => {
		setLoading(false);
		(async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				const _errorMessage =
					'Permission to access location was denied';
				setErrorMsg(_errorMessage);
				showMessage({ message: _errorMessage });
				setCanGoBack(true);
				setTimeout(() => {
					navigation.goBack();
				}, 100);
				return;
			}

			const CURRENT_POSITION = await Location.getCurrentPositionAsync({});
			const FORMATTED_ADDRESS = await getFormattedAddress(
				CURRENT_POSITION.coords,
			);

			setCurrentPosition(CURRENT_POSITION);
			setFormattedAddress(FORMATTED_ADDRESS);
			setLoading(false);
		})();
	}, [navigation]);

	React.useEffect(() => {
		// setCanGoBack(true);
		// setNavigationGroup(setGroup(GROUPS.APP));
	}, [setNavigationGroup]);

	React.useEffect(() => {
		console.log(
			'\nLocation error ===> ',
			currentPosition,
			errorMsg,
			formattedAddress,
		);
	}, [currentPosition, errorMsg, formattedAddress]);

	React.useEffect(() => {
		navigation.addListener('beforeRemove', (e) => {
			if (canGoBack) {
				return;
			}

			// Prevent default behavior of leaving the screen
			e.preventDefault();
			setWarningDialog(true);

			// Prompt the user before leaving the screen
			setPreventBackCallBack(() => {
				return () => {
					setCanGoBack(true);
					setWarningDialog(false);
					navigation.dispatch(e.data.action);
				};
			});

			Alert.alert(
				'Discard changes?',
				"Your location isn't yet recognized. Are you sure to leave the screen?",
				[
					{ text: "Don't leave", style: 'cancel', onPress: () => {} },
					{
						text: 'leave',
						style: 'destructive',
						onPress: () => {
							setCanGoBack(true);
							navigation.dispatch(e.data.action);
						},
					},
				],
			);
		});

		return () => navigation.removeListener('beforeRemove', () => null);
	}, [navigation, canGoBack, warningDialog]);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			{/* Loading view */}
			<View style={STYLES.container}>
				{/* section1 */}
				<View style={STYLES.section1}>
					<PaperText style={STYLES.section1Title}>
						{currentLanguage.INVITE_VIEW.YOUR_ADDRESS}
					</PaperText>

					<PaperText style={STYLES.section1SubTitle}>
						{currentLanguage.INVITE_VIEW.LAUNCH_NOTIFICATION}
					</PaperText>
				</View>

				{/* section2 */}
				<View style={STYLES.section2}>
					<PaperText style={STYLES.section2Title}>
						{currentLanguage.INVITE_VIEW.DETECTING_LOCATION}
					</PaperText>

					{loading ? (
						<ActivityIndicator
							color={CC.light}
							style={{ ...GS.mt5 }}
						/>
					) : (
						<View style={STYLES.formContainer}>
							<TextInput
								style={STYLES.formInput}
								autoComplete={true}
								placeholder='First name'
								value={form.firstName}
								onChangeText={(text) =>
									setForm((prevForm) => ({
										...prevForm,
										firstName: text,
									}))
								}
							/>

							<TextInput
								style={STYLES.formInput}
								autoComplete={true}
								placeholder='Last name'
								value={form.lastName}
								onChangeText={(text) =>
									setForm((prevForm) => ({
										...prevForm,
										lastName: text,
									}))
								}
							/>

							<View style={{ ...GS.inlineItems }}>
								<TextInput
									style={{ ...STYLES.formInput, ...GS.mr2 }}
									autoComplete={true}
									placeholder='House'
									value={form.house}
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											house: text,
										}))
									}
								/>

								<TextInput
									style={STYLES.formInput}
									autoComplete={true}
									placeholder='Apartment'
									value={form.firstName}
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											apartment: text,
										}))
									}
								/>
							</View>
						</View>
					)}
				</View>
			</View>

			{/* TODO: find how to use custom alert (disable due to slowing virtual device) */}
			{/* {warningDialog && (
				<View style={{ ...GS.overlay, ...GS.centered, ...GS.p5 }}>
					<View
						style={{
							...GS.bgLight,
							...GS.roundedMd,
							...GS.w100,
							...GS.shadow,
							...GS.py4,
							...GS.px2,
						}}>
						<NativeTxt
							style={{
								...GS.mb4,
								fontSize: CS.FONT_SIZE_LG,
								...GS.txtPrimary,
							}}>
							Leave?
						</NativeTxt>

						<View style={{ ...GS.mb2 }}>
							<NativeBtn
								title='Leave'
								color={CC.danger}
								onPress={() => preventBackCallBack()}
							/>
						</View>

						<NativeBtn
							title="Don't leave"
							onPress={() => setWarningDialog(false)}
						/>
					</View>
				</View>
			)} */}
		</View>
	);
};

export default SignUpByAddressScreen;
