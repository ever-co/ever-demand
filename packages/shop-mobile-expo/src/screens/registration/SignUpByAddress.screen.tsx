import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Alert,
	TouchableOpacity,
	// Button as NativeBtn,
	TextInput as NativeTextInput,
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
import { useMutation } from '@apollo/client';

// TYPES/INTERFACES
import { RegisterUserArgsInterface } from '../../client/argumentInterfaces';

// CONSTANTS
import GROUPS from '../../router/groups.routes';
import { REQUIRE_NOT_EMPTY_PRESENCE } from '../../constants/rules.validate';

// MUTATIONS
import { REGISTER_USER_MUTATION } from '../../client/mutations';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';
import { setGroup } from '../../store/features/navigation';

// HELPERS
import {
	getFormattedLocation,
	FormattedLocationInterface,
} from '../../helpers/location';

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from '../../components/Common';

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
	const reduxDispatch = useAppDispatch();

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
	const [canGoBack, setCanGoBack] = React.useState<boolean>(false);
	const [, /* preventBackCallBack */ setPreventBackCallBack] = React.useState<
		() => any
	>(() => {});
	const [currentPosition, setCurrentPosition] =
		React.useState<Location.LocationObject | null>(null);
	const [formattedLocation, setFormattedLocation] =
		React.useState<FormattedLocationInterface | null>(null);
	const [addressLoading, setAddressLoading] = React.useState<boolean>(true);
	const [submitFormLoading, setSubmitFormLoading] =
		React.useState<boolean>(false);

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
		formSubmitBtn: {
			...(submitFormLoading
				? {
						backgroundColor: CC.secondaryLight,
						// tslint:disable-next-line: indent
				  }
				: GS.bgSecondary),
		},
		formSkipBtn: { ...GS.bgLight },
		formErrorHelperText: {
			textAlign: 'center',
		},
		formErrorHelperTextApartment: {
			...GS.mb2,
			marginTop: -(CS.SPACE - 5),
		},
	});

	// TODO: Add more constraints
	const VALIDATION_CONSTRAINT: { [name in FormInputNameType]?: object } = {
		firstName: REQUIRE_NOT_EMPTY_PRESENCE,
		lastName: REQUIRE_NOT_EMPTY_PRESENCE,
		house: REQUIRE_NOT_EMPTY_PRESENCE,
		apartment: REQUIRE_NOT_EMPTY_PRESENCE,
	};

	// REFS
	const SCREEN_SCROLL_VIEW_REF = React.useRef<ScrollView | null>(null);
	const FIRST_NAME_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const LAST_NAME_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const HOUSE_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const APARTMENT_INPUT_REF = React.useRef<NativeTextInput | null>(null);

	// MUTATIONS
	const [registerUser] = useMutation(REGISTER_USER_MUTATION);

	// FUNCTIONS
	const onSubmitForm = () => {
		setFormErrors({});

		const FORMATTED_FORM = {
			...form,
			...formattedLocation,
		};

		const FORMATTED_CONSTRAINTS = {
			...VALIDATION_CONSTRAINT,
		};

		if (!formApartmentCheckbox) {
			delete FORMATTED_CONSTRAINTS.apartment;
		}

		const VALIDATION_RESULT = validate(
			FORMATTED_FORM,
			FORMATTED_CONSTRAINTS,
		);

		if (VALIDATION_RESULT) {
			setFormErrors(VALIDATION_RESULT);
			SCREEN_SCROLL_VIEW_REF?.current?.scrollTo({ y: 0 });
			return;
		}

		setSubmitFormLoading(true);
		const NEW_USER_DATA: RegisterUserArgsInterface = {
			registerInput: {
				user: {
					firstName: FORMATTED_FORM.firstName,
					lastName: FORMATTED_FORM.lastName,
					apartment: formApartmentCheckbox
						? FORMATTED_FORM.apartment
						: '',
					geoLocation: {
						loc: {
							coordinates: [
								FORMATTED_FORM.longitude as number,
								FORMATTED_FORM.latitude as number,
							],
							type: 'Point',
						},
						house: FORMATTED_FORM.house,
						streetAddress: FORMATTED_FORM.streetAddress as string,
						city: FORMATTED_FORM.city as string,
						countryId: FORMATTED_FORM.countryId as number,
					},
				},
			},
		};

		console.log(NEW_USER_DATA);
		registerUser({
			variables: {
				...NEW_USER_DATA,
			},
			onCompleted: (TData) => {
				reduxDispatch(setUserData(TData));
				reduxDispatch(setGroup(GROUPS.APP));
				showMessage({
					message: 'Successful account creation',
					type: 'success',
				});
				setSubmitFormLoading(false);
			},
			onError: (ApolloError) => {
				console.log('ApolloError ==>', ApolloError);
				showMessage({
					message: ApolloError.name,
					description: ApolloError.message,
					type: 'danger',
				});
				setSubmitFormLoading(false);
			},
		});
	};

	// EFFECTS
	React.useEffect(() => {
		setAddressLoading(false);
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
			const FORMATTED_ADDRESS = await getFormattedLocation(
				CURRENT_POSITION.coords,
			);

			setCurrentPosition(CURRENT_POSITION);
			setFormattedLocation(FORMATTED_ADDRESS);
			setAddressLoading(false);
		})();
	}, [NAVIGATION]);

	React.useEffect(() => {
		// setCanGoBack(true);
		// reduxDispatch(setGroup(GROUPS.APP));
	}, [reduxDispatch]);

	React.useEffect(() => {
		console.log(
			'\nLocation error ===> ',
			currentPosition,
			formattedLocation,
		);
	}, [currentPosition, formattedLocation]);

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
				'Leave sign-up?',
				"Your account isn't yet created! Are you sure to leave the screen?",
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
		<ScrollView ref={SCREEN_SCROLL_VIEW_REF} style={{ ...GS.screenStatic }}>
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
					{addressLoading ? (
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
									ref={FIRST_NAME_INPUT_REF}
									value={form.firstName}
									placeholder='First name'
									autoComplete='name'
									textContentType='name'
									keyboardType='name-phone-pad'
									style={STYLES.formInput}
									error={!!formErrors.firstName}
									mode='outlined'
									returnKeyLabel='next'
									returnKeyType='next'
									onSubmitEditing={() =>
										LAST_NAME_INPUT_REF?.current?.focus()
									}
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											firstName: text,
										}))
									}
								/>

								<HelperText
									visible={!!formErrors?.firstName}
									style={STYLES.formErrorHelperText}
									type='error'>
									{formErrors?.firstName
										? formErrors.firstName[0]
										: ''}
								</HelperText>
							</View>

							<View style={STYLES.formInputContainer}>
								<TextInput
									ref={LAST_NAME_INPUT_REF}
									value={form.lastName}
									placeholder='Last name'
									autoComplete='name-family'
									textContentType='familyName'
									keyboardType='name-phone-pad'
									style={STYLES.formInput}
									error={!!formErrors.lastName}
									mode='outlined'
									returnKeyLabel='next'
									returnKeyType='next'
									onSubmitEditing={() =>
										HOUSE_INPUT_REF?.current?.focus()
									}
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											lastName: text,
										}))
									}
								/>
								<HelperText
									visible={!!formErrors?.lastName}
									style={STYLES.formErrorHelperText}
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
										ref={HOUSE_INPUT_REF}
										value={form.house}
										placeholder='House'
										keyboardType='default'
										style={{
											...STYLES.formInput,
											...GS.mr2,
										}}
										error={!!formErrors.house}
										mode='outlined'
										returnKeyLabel='next'
										returnKeyType='next'
										onSubmitEditing={() =>
											APARTMENT_INPUT_REF?.current?.focus()
										}
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												house: text,
											}))
										}
									/>
									<HelperText
										visible={!!formErrors?.house}
										style={STYLES.formErrorHelperText}
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
										ref={APARTMENT_INPUT_REF}
										value={
											formApartmentCheckbox
												? form.apartment
												: ''
										}
										placeholder={CURRENT_LANGUAGE.APARTMENT}
										keyboardType='default'
										error={
											!!formErrors.apartment &&
											formApartmentCheckbox
										}
										disabled={!formApartmentCheckbox}
										editable={formApartmentCheckbox}
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
										returnKeyLabel='done'
										returnKeyType='done'
										onSubmitEditing={onSubmitForm}
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
										style={{
											...GS.justifyContentBetween,
											...GS.mb0,
										}}>
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
										visible={
											!!formErrors?.apartment &&
											formApartmentCheckbox
										}
										type='error'
										style={{
											...STYLES.formErrorHelperText,
											...STYLES.formErrorHelperTextApartment,
										}}>
										{formErrors.apartment
											? formErrors.apartment[0]
											: ''}
									</HelperText>
								</View>
							</View>

							<Button
								loading={submitFormLoading}
								disabled={submitFormLoading}
								uppercase={false}
								style={{
									...STYLES.formBtn,
									...STYLES.formSubmitBtn,
								}}
								labelStyle={STYLES.formBtnLabel}
								theme={{ colors: { primary: CC.primary } }}
								onPress={onSubmitForm}>
								Submit
							</Button>

							<Button
								disabled={submitFormLoading}
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
