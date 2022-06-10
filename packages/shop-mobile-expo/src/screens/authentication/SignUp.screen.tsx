import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Alert,
	TouchableOpacity,
	TextInput as NativeTextInput,
} from 'react-native';
import {
	ActivityIndicator,
	TextInput,
	Button,
	HelperText,
	Checkbox,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { showMessage } from 'react-native-flash-message';
import { validate } from 'validate.js';
import { useMutation } from '@apollo/client';

// TYPES/INTERFACES
import type {
	UserLoginArgsInterface,
	UserRegisterArgsInterface,
} from '../../client/user/argumentInterfaces';

// CONSTANTS
import GROUPS from '../../router/groups.routes';
import {
	REQUIRE_EMAIL,
	REQUIRE_NOT_EMPTY_PRESENCE,
} from '../../constants/rules.validate';

// MUTATIONS
import {
	REGISTER_USER_MUTATION,
	USER_LOGIN,
} from '../../client/user/mutations';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
	onUserSignUpByAddressSuccess,
	getUserData,
} from '../../store/features/user';
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
	| 'email'
	| 'firstName'
	| 'lastName'
	| 'phone'
	| 'password'
	| 'confirmPassword'
	| 'city'
	| 'street'
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

const SignUpScreen = () => {
	// SELECTORS
	const CURRENT_LANGUAGE = useAppSelector(getLanguage);
	const CURRENT_USER_DATA = useAppSelector(getUserData);

	// ACTIONS
	const reduxDispatch = useAppDispatch();

	// NAVIGATION
	const NAVIGATION = useNavigation();
	const ROUTE = useRoute();

	// STATES
	const [warningDialog, setWarningDialog] = React.useState<boolean>(false);
	const [form, setForm] = React.useState<FormType>({
		email: '',
		firstName: '',
		lastName: '',
		password: '',
		confirmPassword: '',
		phone: '',
		city: '',
		street: '',
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
	const [, setCurrentPosition] =
		React.useState<Location.LocationObject | null>(null);
	const [formattedLocation, setFormattedLocation] =
		React.useState<FormattedLocationInterface | null>(null);
	const [securePassword, setSecurePassword] = React.useState<boolean>(true);
	const [secureConfirmPassword, setSecureConfirmPassword] =
		React.useState<boolean>(true);
	const [addressLoading, setAddressLoading] = React.useState<boolean>(true);
	const [submitFormLoading, setSubmitFormLoading] =
		React.useState<boolean>(false);

	// DATA
	const ROUTE_PARAMS = ROUTE.params as any;
	const VALIDATION_CONSTRAINT: { [name in FormInputNameType]?: object } = {
		email: REQUIRE_EMAIL,
		password: {
			...REQUIRE_NOT_EMPTY_PRESENCE,
			length: { minimum: 6 },
		},
		confirmPassword: {
			equality: 'password',
		},
		firstName: { ...REQUIRE_NOT_EMPTY_PRESENCE },
		lastName: { ...REQUIRE_NOT_EMPTY_PRESENCE },
		city: REQUIRE_NOT_EMPTY_PRESENCE,
		street: REQUIRE_NOT_EMPTY_PRESENCE,
		house: REQUIRE_NOT_EMPTY_PRESENCE,
		apartment: REQUIRE_NOT_EMPTY_PRESENCE,
	};

	// REFS
	const SCREEN_SCROLL_VIEW_REF = React.useRef<ScrollView | null>(null);
	const EMAIL_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const PASSWORD_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const CONFIRM_PASSWORD_INPUT_REF = React.useRef<NativeTextInput | null>(
		null,
	);
	const FIRST_NAME_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const LAST_NAME_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const CITY_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const STREET_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const HOUSE_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const APARTMENT_INPUT_REF = React.useRef<NativeTextInput | null>(null);

	// MUTATIONS
	const [handleUserRegistration] = useMutation(REGISTER_USER_MUTATION);
	const [handleUserLogin] = useMutation(USER_LOGIN);

	// LOCAL STYLES
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
		},
		section1: {
			...GS.centered,
			...GS.py5,
			...GS.my4,
		},
		section1Title: {
			...GS.txtCenter,
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

	// FUNCTIONS
	const onSubmitForm = () => {
		setFormErrors({});

		const FORMATTED_FORM = {
			...formattedLocation,
			...form,
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
		const CREATE_INVITE_INPUT: UserRegisterArgsInterface = {
			user: {
				email: FORMATTED_FORM.email,
				firstName: FORMATTED_FORM.firstName,
				lastName: FORMATTED_FORM.lastName,
				apartment: FORMATTED_FORM.apartment,
				geoLocation: {
					countryId: 0,
					city: FORMATTED_FORM.city,
					streetAddress: FORMATTED_FORM.street,
					house: FORMATTED_FORM.house,
					postcode: null,
					notes: null,
					loc: {
						type: 'Point',
						coordinates: [
							FORMATTED_FORM?.longitude || 0,
							FORMATTED_FORM?.latitude || 0,
						],
					},
				},
			},
			password: form.password,
		};

		handleUserRegistration({
			variables: {
				registerInput: CREATE_INVITE_INPUT,
			},
			onCompleted: (TData) => {
				if (!TData?.registerUser) {
					setSubmitFormLoading(false);
				}

				const USER_LOGIN_INPUT: UserLoginArgsInterface = {
					email: TData.registerUser.email,
					password: FORMATTED_FORM.password,
				};

				handleUserLogin({
					variables: {
						...USER_LOGIN_INPUT,
					},
					onCompleted: (TDataSignIn) => {
						console.log('TDataSignIn', TDataSignIn);
						setSubmitFormLoading(false);
						if (!TDataSignIn?.userLogin) {
							showMessage({
								message: 'Wrong email or password',
								type: 'warning',
							});
							return;
						}

						reduxDispatch(
							onUserSignUpByAddressSuccess({
								user: TDataSignIn.userLogin,
								invite: null,
							}),
						);

						reduxDispatch(setGroup(GROUPS.APP));

						showMessage({
							message: "Great job 🎉, you're sign-up as user",
							type: 'success',
						});
					},
					onError: (ApolloError) => {
						console.log(
							'ApolloError ==>',
							ApolloError,
							USER_LOGIN_INPUT,
						);
						showMessage({
							message: ApolloError.name,
							description: ApolloError.message,
							type: 'danger',
						});
						setSubmitFormLoading(false);
					},
				});
			},
			onError: (ApolloError) => {
				console.log(
					'ApolloError ==>',
					ApolloError,
					CREATE_INVITE_INPUT,
				);
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
		if (!ROUTE_PARAMS?.fromApp) {
			setAddressLoading(true);
			(async () => {
				const { status } =
					await Location.requestForegroundPermissionsAsync();

				if (status !== 'granted') {
					const ERROR_MSG =
						'Permission to access location was denied';
					showMessage({ message: ERROR_MSG });
					setCanGoBack(true);
					setTimeout(() => {
						NAVIGATION.goBack();
					}, 100);
					return;
				}

				const CURRENT_POSITION = await Location.getCurrentPositionAsync(
					{},
				);
				const FORMATTED_ADDRESS = await getFormattedLocation(
					CURRENT_POSITION.coords,
				);
				setForm({
					...form,
					city: FORMATTED_ADDRESS?.city || '',
					street: FORMATTED_ADDRESS?.streetAddress || '',
				});
				setCurrentPosition(CURRENT_POSITION);
				setFormattedLocation(FORMATTED_ADDRESS);
				setAddressLoading(false);
			})();
		} else {
			setAddressLoading(false);
			if (CURRENT_USER_DATA?.invite?.__typename === 'Invite') {
				setForm({
					...form,
					city: CURRENT_USER_DATA?.invite?.geoLocation.city,
					street: CURRENT_USER_DATA?.invite?.geoLocation
						.streetAddress,
					house: CURRENT_USER_DATA?.invite?.geoLocation.house,
					apartment: CURRENT_USER_DATA?.invite?.apartment?.toString(),
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect(() => {
		NAVIGATION.addListener('beforeRemove', (e) => {
			if (canGoBack) {
				return;
			}

			// Prevent default behavior of leaving the screen
			e.preventDefault();
			setWarningDialog(true);

			// Prompt the user before leaving the screen
			setPreventBackCallBack(() => () => {
				setCanGoBack(true);
				setWarningDialog(false);
				NAVIGATION.dispatch(e.data.action);
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
		<ScrollView
			ref={SCREEN_SCROLL_VIEW_REF}
			style={{ ...GS.screenStatic }}
			overScrollMode='never'
			showsVerticalScrollIndicator={false}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			{/* Loading view */}
			<View style={STYLES.container}>
				{/* section1 */}
				<View style={STYLES.section1}>
					<PaperText style={STYLES.section1Title}>Sign Up</PaperText>
				</View>

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
									ref={EMAIL_INPUT_REF}
									value={form.email}
									placeholder={'Email'}
									autoComplete='street-address'
									textContentType='emailAddress'
									keyboardType='email-address'
									autoCapitalize='none'
									style={STYLES.formInput}
									error={!!formErrors.email}
									mode='outlined'
									returnKeyLabel='next'
									returnKeyType='next'
									onSubmitEditing={() =>
										PASSWORD_INPUT_REF?.current?.focus()
									}
									onChangeText={(text) =>
										setForm((prevForm) => ({
											...prevForm,
											email: text,
										}))
									}
								/>

								<HelperText
									visible={!!formErrors?.email}
									style={STYLES.formErrorHelperText}
									type='error'>
									{formErrors?.email
										? formErrors.email[0]
										: ''}
								</HelperText>
							</View>

							<View style={{ ...GS.inlineItems }}>
								<View
									style={{
										...STYLES.formInputContainer,
										...GS.flex1,
										...GS.mr2,
									}}>
									<TextInput
										ref={PASSWORD_INPUT_REF}
										value={form.password}
										placeholder={'Password'}
										autoComplete='password'
										textContentType='password'
										keyboardType='default'
										secureTextEntry={securePassword}
										autoCapitalize='none'
										style={STYLES.formInput}
										right={
											<TextInput.Icon
												name={
													securePassword
														? 'eye-off'
														: 'eye'
												}
												size={CS.FONT_SIZE}
												onPress={() =>
													setSecurePassword(
														!securePassword,
													)
												}
											/>
										}
										error={!!formErrors.password}
										mode='outlined'
										returnKeyLabel='next'
										returnKeyType='next'
										onSubmitEditing={() =>
											CONFIRM_PASSWORD_INPUT_REF?.current?.focus()
										}
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												password: text,
											}))
										}
									/>

									<HelperText
										visible={!!formErrors?.password}
										style={STYLES.formErrorHelperText}
										type='error'>
										{formErrors?.password
											? formErrors.password[0]
											: ''}
									</HelperText>
								</View>

								<View
									style={{
										...STYLES.formInputContainer,
										...GS.flex1,
									}}>
									<TextInput
										ref={CONFIRM_PASSWORD_INPUT_REF}
										value={form.confirmPassword}
										placeholder={'Confirm password'}
										autoComplete='password'
										textContentType='password'
										keyboardType='default'
										secureTextEntry={secureConfirmPassword}
										autoCapitalize='none'
										style={STYLES.formInput}
										right={
											<TextInput.Icon
												name={
													secureConfirmPassword
														? 'eye-off'
														: 'eye'
												}
												size={CS.FONT_SIZE}
												onPress={() =>
													setSecureConfirmPassword(
														!secureConfirmPassword,
													)
												}
											/>
										}
										error={!!formErrors.confirmPassword}
										mode='outlined'
										returnKeyLabel='next'
										returnKeyType='next'
										onSubmitEditing={() =>
											FIRST_NAME_INPUT_REF?.current?.focus()
										}
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												confirmPassword: text,
											}))
										}
									/>

									<HelperText
										visible={!!formErrors?.confirmPassword}
										style={STYLES.formErrorHelperText}
										type='error'>
										{formErrors?.confirmPassword
											? formErrors.confirmPassword[0]
											: ''}
									</HelperText>
								</View>
							</View>

							<View
								style={{
									...STYLES.formInputContainer,
								}}>
								<TextInput
									ref={FIRST_NAME_INPUT_REF}
									value={form.firstName}
									placeholder={'First name'}
									autoComplete='street-address'
									textContentType='addressCity'
									keyboardType='default'
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

							<View
								style={{
									...STYLES.formInputContainer,
								}}>
								<TextInput
									ref={LAST_NAME_INPUT_REF}
									value={form.lastName}
									placeholder={'Last name'}
									autoComplete='street-address'
									textContentType='addressCity'
									keyboardType='default'
									style={STYLES.formInput}
									error={!!formErrors.lastName}
									mode='outlined'
									returnKeyLabel='next'
									returnKeyType='next'
									onSubmitEditing={() =>
										CITY_INPUT_REF?.current?.focus()
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
									{formErrors?.lastName
										? formErrors.lastName[0]
										: ''}
								</HelperText>
							</View>

							<View style={GS.inlineItems}>
								<View
									style={{
										...STYLES.formInputContainer,
										...GS.flex1,
										...GS.mr2,
									}}>
									<TextInput
										ref={CITY_INPUT_REF}
										value={form.city}
										placeholder={CURRENT_LANGUAGE.CITY}
										autoComplete='street-address'
										textContentType='addressCity'
										keyboardType='default'
										style={STYLES.formInput}
										error={!!formErrors.city}
										mode='outlined'
										returnKeyLabel='next'
										returnKeyType='next'
										onSubmitEditing={() =>
											STREET_INPUT_REF?.current?.focus()
										}
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												city: text,
											}))
										}
									/>

									<HelperText
										visible={!!formErrors?.city}
										style={STYLES.formErrorHelperText}
										type='error'>
										{formErrors?.city
											? formErrors.city[0]
											: ''}
									</HelperText>
								</View>

								<View
									style={{
										...STYLES.formInputContainer,
										...GS.flex1,
									}}>
									<TextInput
										ref={STREET_INPUT_REF}
										value={form.street}
										placeholder={CURRENT_LANGUAGE.STREET}
										autoComplete='street-address'
										textContentType='fullStreetAddress'
										keyboardType='default'
										style={STYLES.formInput}
										error={!!formErrors.street}
										mode='outlined'
										returnKeyLabel='next'
										returnKeyType='next'
										onSubmitEditing={() =>
											HOUSE_INPUT_REF?.current?.focus()
										}
										onChangeText={(text) =>
											setForm((prevForm) => ({
												...prevForm,
												street: text,
											}))
										}
									/>
									<HelperText
										visible={!!formErrors?.street}
										style={STYLES.formErrorHelperText}
										type='error'>
										{formErrors.street
											? formErrors.street[0]
											: ''}
									</HelperText>
								</View>
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
										placeholder={CURRENT_LANGUAGE.HOUSE}
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
						</View>
					)}
				</View>
			</View>
		</ScrollView>
	);
};

export default SignUpScreen;
