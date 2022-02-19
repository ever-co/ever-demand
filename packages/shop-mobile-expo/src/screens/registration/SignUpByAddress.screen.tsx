import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Alert,
	TouchableOpacity,
	// Button as NativeBtn,
	// Text as NativeTxt,
} from 'react-native';
import {
	ActivityIndicator,
	TextInput,
	Button,
	HelperText,
	Checkbox,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { showMessage } from 'react-native-flash-message';
import { validate } from 'validate.js';

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

//  CONSTANTS
import { REQUIRE_PRESENCE } from '../../constants/rules.validate';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

// TYPE
export type FormInputNameType =
	| 'firstName'
	| 'lastName'
	| 'house'
	| 'apartment';
export type FormType = {
	[name in FormInputNameType]: string;
};
export type FormErrorsType =
	| {
			[name in FormInputNameType]: string[] | undefined;
			// tslint:disable-next-line: indent
	  }
	| { [name: string]: string[] | undefined };

const SignUpByAddressScreen = () => {
	// SELECTORS
	const CURRENT_LANGUAGE = useAppSelector(getLanguage);

	// ACTIONS
	const SET_NAVIGATION_GROUP = useAppDispatch();

	// NAVIGATION
	const NAVIGATION = useNavigation();

	// STATES
	const [warningDialog, setWarningDialog] = React.useState<boolean>(false);
	const [form, setForm] = React.useState<FormType>({
		firstName: '',
		lastName: '',
		house: '',
		apartment: '',
	});
	const [formApartmentCheckbox, setFormApartmentCheckbox] =
		React.useState<boolean>(true);
	const [formErrors, setFormErrors] = React.useState<FormErrorsType>({});
	const [loading, setLoading] = React.useState<boolean>(true);
	const [canGoBack, setCanGoBack] = React.useState<boolean>(false);
	const [, /* preventBackCallBack */ setPreventBackCallBack] = React.useState<
		() => any
	>(() => {});
	const [currentPosition, setCurrentPosition] =
		React.useState<Location.LocationObject | null>(null);
	const [formattedAddress, setFormattedAddress] =
		React.useState<FormattedAddressInterface | null>(null);

	// DATA
	const STYLES = StyleSheet.create({
		screen: {
			...GS.screen,
			...GS.bgSuccess,
			overflow: 'hidden',
		},
		container: {
			...GS.screen,
			...GS.centered,
			...GS.bgTransparent,
			...GS.px5,
			...GS.pb5,
			...GS.mx5,
		},
		section1: {
			...GS.centered,
			...GS.py5,
			...GS.my5,
			height: CS.FONT_SIZE_LG * 1.8 * 5,
			marginTop: CS.FONT_SIZE_LG * 1.8 * 3,
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
		section2: { ...GS.py2, ...GS.w100, alignItems: 'center' },
		section2Title: {
			...GS.txtCenter,
			...GS.mb5,
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_SM * 2,
		},
		formContainer: {
			...GS.w100,
		},
		formInputContainer: {},
		formInputContainerRow: { flex: 1 },
		formInput: { ...GS.bgTransparent, ...GS.mb0, textAlign: 'center' },
		formInputDisabled: { opacity: 0.4 },
		formBtn: { ...GS.mb2 },
		formBtnLabel: {
			...GS.py1,
			...GS.txtCapitalize,
			color: CC.light,
			fontSize: CS.FONT_SIZE + 3,
		},
		formSubmitBtn: { ...GS.bgSecondary },
		formSkipBtn: { ...GS.bgLight },
	});

	const VALIDATION_CONSTRAINT = {
		firstName: REQUIRE_PRESENCE,
		lastName: REQUIRE_PRESENCE,
		house: REQUIRE_PRESENCE,
		apartment: REQUIRE_PRESENCE,
	};

	// FUNCTIONS
	const onSubmitForm = () => {
		setFormErrors({});

		const FORMATTED_FORM = {
			...form,
			...formattedAddress,
		};

		const VALIDATION_RESULT = validate(
			FORMATTED_FORM,
			VALIDATION_CONSTRAINT,
		);

		if (VALIDATION_RESULT) {
			return setFormErrors(VALIDATION_RESULT);
		}

		setLoading(true);
	};

	// EFFECTS
	React.useEffect(() => {
		setLoading(false);
		(async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				const ERROR_MSG = 'Permission to access location was denied';
				showMessage({ message: ERROR_MSG });
				setCanGoBack(true);
				setTimeout(() => {
					NAVIGATION.goBack();
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
	}, [NAVIGATION]);

	React.useEffect(() => {
		// setCanGoBack(true);
		// SET_NAVIGATION_GROUP(setGroup(GROUPS.APP));
	}, [SET_NAVIGATION_GROUP]);

	React.useEffect(() => {
		console.log(
			'\nLocation error ===> ',
			currentPosition,
			formattedAddress,
		);
	}, [currentPosition, formattedAddress]);

	React.useEffect(() => {
		NAVIGATION.addListener('beforeRemove', (e) => {
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
					NAVIGATION.dispatch(e.data.action);
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
							NAVIGATION.dispatch(e.data.action);
						},
					},
				],
			);
		});

		return () => NAVIGATION.removeListener('beforeRemove', () => null);
	}, [NAVIGATION, canGoBack, warningDialog]);

	return (
		<ScrollView style={{ ...GS.screenStatic }}>
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
						{CURRENT_LANGUAGE.INVITE_VIEW.YOUR_ADDRESS}
					</PaperText>

					<PaperText style={STYLES.section1SubTitle}>
						{CURRENT_LANGUAGE.INVITE_VIEW.LAUNCH_NOTIFICATION}
					</PaperText>
				</View>

				{/* section2 */}
				<View style={STYLES.section2}>
					{loading ? (
						<>
							<PaperText style={STYLES.section2Title}>
								{
									CURRENT_LANGUAGE.INVITE_VIEW
										.DETECTING_LOCATION
								}
							</PaperText>
							<ActivityIndicator
								color={CC.light}
								style={{ ...GS.mt5 }}
							/>
						</>
					) : (
						<View style={STYLES.formContainer}>
							<View style={STYLES.formInputContainer}>
								<TextInput
									value={form.firstName}
									placeholder='First name'
									autoComplete='name'
									textContentType='name'
									error={!!formErrors.firstName}
									style={STYLES.formInput}
									mode='outlined'
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											firstName: text,
										}))
									}
								/>

								<HelperText
									visible={!!formErrors?.firstName}
									type='error'>
									{formErrors?.firstName
										? formErrors.firstName[0]
										: ''}
								</HelperText>
							</View>

							<View style={STYLES.formInputContainer}>
								<TextInput
									value={form.lastName}
									placeholder='Last name'
									autoComplete='name-family'
									textContentType='familyName'
									keyboardType='name-phone-pad'
									style={STYLES.formInput}
									mode='outlined'
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											lastName: text,
										}))
									}
								/>
								<HelperText
									visible={!!formErrors?.lastName}
									type='error'>
									{formErrors.lastName
										? formErrors.lastName[0]
										: ''}
								</HelperText>
							</View>

							<View style={{ ...GS.row }}>
								<View
									style={{
										...STYLES.formInputContainer,
										...STYLES.formInputContainerRow,
									}}>
									<TextInput
										value={form.house}
										placeholder='House'
										keyboardType='default'
										style={{
											...STYLES.formInput,
											...GS.mr2,
										}}
										mode='outlined'
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												house: text,
											}))
										}
									/>
									<HelperText
										visible={!!formErrors?.house}
										type='error'>
										{formErrors.house
											? formErrors.house[0]
											: ''}
									</HelperText>
								</View>

								<View
									style={{
										...STYLES.formInputContainer,
										...STYLES.formInputContainerRow,
									}}>
									<TextInput
										value={
											formApartmentCheckbox
												? form.apartment
												: ''
										}
										disabled={!formApartmentCheckbox}
										editable={formApartmentCheckbox}
										placeholder={CURRENT_LANGUAGE.APARTMENT}
										keyboardType='default'
										style={{
											...STYLES.formInput,
											...(!formApartmentCheckbox
												? STYLES.formInputDisabled
												: {}),
										}}
										theme={{
											colors: { primary: CC.secondary },
										}}
										mode='outlined'
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												apartment: text,
											}))
										}
									/>

									<TouchableOpacity
										onPress={() =>
											setFormApartmentCheckbox(
												!formApartmentCheckbox,
											)
										}
										style={GS.justifyContentBetween}>
										<PaperText>
											{CURRENT_LANGUAGE.APARTMENT}
										</PaperText>

										<Checkbox.Android
											status={
												formApartmentCheckbox
													? 'checked'
													: 'unchecked'
											}
											onPress={() =>
												setFormApartmentCheckbox(
													!formApartmentCheckbox,
												)
											}
										/>
									</TouchableOpacity>

									<HelperText
										visible={!!formErrors?.apartment}
										type='error'>
										{formErrors.apartment
											? formErrors.apartment[0]
											: ''}
									</HelperText>
								</View>
							</View>

							<Button
								onPress={onSubmitForm}
								uppercase={false}
								style={{
									...STYLES.formBtn,
									...STYLES.formSubmitBtn,
								}}
								labelStyle={STYLES.formBtnLabel}
								theme={{ colors: { primary: CC.primary } }}>
								Submit
							</Button>

							<Button
								uppercase={false}
								style={{
									...STYLES.formBtn,
									...STYLES.formSkipBtn,
								}}
								labelStyle={{
									...STYLES.formBtnLabel,
									color: CC.dark,
								}}>
								Skip
							</Button>
						</View>
					)}
				</View>

				{/* TODO: find how to use a custom alert (disable due to slowing virtual device) */}
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
		</ScrollView>
	);
};

export default SignUpByAddressScreen;
