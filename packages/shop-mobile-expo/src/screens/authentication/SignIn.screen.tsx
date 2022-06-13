import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	TextInput as NativeTextInput,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { showMessage } from 'react-native-flash-message';
import { validate } from 'validate.js';
import { useMutation } from '@apollo/client';

// TYPES/INTERFACES
import type { UserLoginArgsInterface } from '../../client/user/argumentInterfaces';

// CONSTANTS
import GROUPS from '../../router/groups.routes';
import {
	REQUIRE_EMAIL,
	REQUIRE_NOT_EMPTY_PRESENCE,
} from '../../constants/rules.validate';

// MUTATIONS
import { USER_LOGIN } from '../../client/user/mutations';

// ACTIONS & SELECTORS
import { useAppDispatch } from '../../store/hooks';
import { onUserSignUpByAddressSuccess } from '../../store/features/user';
import { setGroup } from '../../store/features/navigation';

// COMPONENTS
import { FocusAwareStatusBar } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

// TYPE
export type FormInputNameType = 'email' | 'password';
export type FormType = {
	[name in FormInputNameType]: string;
};
export type FormErrorsType =
	| {
			[name in FormInputNameType]: string[] | undefined;
			// tslint:disable-next-line: indent
	  }
	| { [name: string]: string[] | undefined };

const SignInScreen = () => {
	// ACTIONS
	const reduxDispatch = useAppDispatch();

	// STATES
	const [form, setForm] = React.useState<FormType>({
		email: '',
		password: '',
	});
	const [formErrors, setFormErrors] = React.useState<FormErrorsType>({});
	const [securePassword, setSecurePassword] = React.useState<boolean>(true);
	const [submitFormLoading, setSubmitFormLoading] =
		React.useState<boolean>(false);

	// DATA
	const VALIDATION_CONSTRAINT: { [name in FormInputNameType]?: object } = {
		email: REQUIRE_EMAIL,
		password: {
			...REQUIRE_NOT_EMPTY_PRESENCE,
			length: { minimum: 6 },
		},
	};

	// REFS
	const SCREEN_SCROLL_VIEW_REF = React.useRef<ScrollView | null>(null);
	const EMAIL_INPUT_REF = React.useRef<NativeTextInput | null>(null);
	const PASSWORD_INPUT_REF = React.useRef<NativeTextInput | null>(null);

	// MUTATIONS
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
			...GS.bgTransparent,
			...GS.px5,
			...GS.pb5,
			...GS.flex1,
		},
		section1Title: {
			...GS.txtCenter,
			...GS.FF_NunitoBold,
			...GS.mb5,
			fontSize: CS.FONT_SIZE_LG * 1.8,
		},
		formContainer: {
			...GS.w100,
		},
		formInputContainer: {},
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
			...GS.w100,
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
			...form,
		};

		const FORMATTED_CONSTRAINTS = {
			...VALIDATION_CONSTRAINT,
		};

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
		const USER_LOGIN_INPUT: UserLoginArgsInterface = {
			email: FORMATTED_FORM.email,
			password: FORMATTED_FORM.password,
		};

		handleUserLogin({
			variables: {
				...USER_LOGIN_INPUT,
			},
			onCompleted: (TData) => {
				console.log('TData', TData);
				setSubmitFormLoading(false);
				if (!TData?.userLogin) {
					showMessage({
						message: 'Wrong email or password',
						type: 'warning',
					});
					return;
				}

				reduxDispatch(
					onUserSignUpByAddressSuccess({
						user: TData.userLogin,
						invite: null,
					}),
				);
				reduxDispatch(setGroup(GROUPS.APP));
				showMessage({
					message: "Welcome back 🎉, you're sign-in as user",
					type: 'success',
				});
			},
			onError: (ApolloError) => {
				console.log('ApolloError ==>', ApolloError, USER_LOGIN_INPUT);
				showMessage({
					message: ApolloError.name,
					description: ApolloError.message,
					type: 'danger',
				});
				setSubmitFormLoading(false);
			},
		});
	};

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			{/* Loading view */}
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={STYLES.container}>
					<View style={{ ...GS.flex1, ...GS.centered }}>
						<View style={STYLES.formContainer}>
							<Text style={STYLES.section1Title}>Sign In</Text>

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

							<View style={{ ...STYLES.formInputContainer }}>
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
									returnKeyLabel='done'
									returnKeyType='done'
									onSubmitEditing={onSubmitForm}
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
						Sign In
					</Button>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
};

export default SignInScreen;
