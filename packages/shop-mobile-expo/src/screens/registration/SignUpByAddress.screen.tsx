import React from 'react';
import {
	View,
	StyleSheet,
	Alert,
	// Button as NativeBtn,
	// Text as NativeTxt,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// CONSTANTS
import GROUPS from '../../router/groups.routes';

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';
import { setGroup } from '../../store/features/navigation';

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

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
	networkBtnFacebook: { flex: 1, backgroundColor: CC.facebook },
	networkBtnGoogle: { flex: 1, backgroundColor: CC.google },
});

const SignUpByAddressScreen = () => {
	// SELECTORS
	const currentLanguage = useAppSelector(getLanguage);

	// ACTIONS
	const setNavigationGroup = useAppDispatch();

	// NAVIGATIOn
	const navigation = useNavigation();

	// STATES
	const [warningDialog, setWarningDialog] = React.useState<boolean>(false);
	const [canGoBack, setCanGoBack] = React.useState<boolean>(false);
	// const [preventBackCallBack, setPreventBackCallBack] = React.useState<
	// 	() => any
	// >(() => { });

	// EFFECTS
	React.useEffect(() => {
		setTimeout(() => {
			setNavigationGroup(setGroup(GROUPS.APP));
			setCanGoBack(true);
		}, 4500);
	}, [setNavigationGroup]);

	React.useEffect(() => {
		navigation.addListener('beforeRemove', (e) => {
			if (canGoBack) {
				return;
			}

			// Prevent default behavior of leaving the screen
			e.preventDefault();
			setWarningDialog(true);

			// Prompt the user before leaving the screen
			// setPreventBackCallBack(() => {
			// 	return () => {
			// 		setCanGoBack(true);
			// 		setWarningDialog(false);
			// 		navigation.dispatch(e.data.action);
			// 	};
			// });

			Alert.alert(
				'Discard changes?',
				"Your device isn't yet recognized. Are you sure to leave the screen?",
				[
					{ text: "Don't leave", style: 'cancel', onPress: () => {} },
					{
						text: 'leave',
						style: 'destructive',
						// If the user confirmed, then we dispatch the action we blocked earlier
						// This will continue the action that had triggered the removal of the screen
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

					<ActivityIndicator color={CC.light} style={{ ...GS.mt5 }} />
				</View>
			</View>

			{/* TODO: find how to use custom alert (disable due to slowing device) */}
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
