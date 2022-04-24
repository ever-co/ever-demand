import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import AntDesignIcon from '@expo/vector-icons/AntDesign';

// ACTIONS & SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

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
		zIndex: 1,
	},
	titleLogoContainer: {
		...GS.centered,
		flex: 1,
	},
	logoImg: { ...GS.w100, height: 100, marginBottom: -20 },
	logoTitle: {
		...GS.txtCapitalize,
		fontSize: CS.FONT_SIZE + 1,
		opacity: 0.7,
	},
	networkBtnFacebook: { flex: 1, backgroundColor: CC.facebook },
	networkBtnGoogle: { flex: 1, backgroundColor: CC.google },
});

const HomeAuthScreen = () => {
	// SELECTORS
	const currentLanguage = useAppSelector(getLanguage);

	// NAVIGATION
	const navigation = useNavigation();

	// FUNCTIONS
	const onPressSignUp = () => {
		navigation.navigate('STACK/SIGN_UP' as never);
	};

	const onPressSignIn = () => {
		navigation.navigate('STACK/SIGN_IN' as never);
	};

	const onPressInvite = () => {
		navigation.navigate('STACK/SIGN_UP_BY_ADDRESS' as never);
	};

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			<View style={STYLES.container}>
				{/*  title logo */}
				<View style={STYLES.titleLogoContainer}>
					<Image
						source={require('../../assets/img/ever/logo.png')}
						resizeMode='contain'
						style={STYLES.logoImg}
					/>
					<Text style={STYLES.logoTitle}>
						{currentLanguage.INVITE_VIEW.BY_CODE.LOGO.DETAILS}
					</Text>
				</View>

				{/* Social Networks buttons */}
				<View style={{ ...GS.py4 }}>
					<View>
						<Button
							mode='contained'
							style={{
								...GS.bgSecondary,
								...GS.mb2,
							}}
							labelStyle={{ ...GS.txtCapitalize, ...GS.py1 }}
							onPress={() => onPressSignUp()}>
							{currentLanguage.INVITE_VIEW.GET_IN_BY_ADDRESS}
						</Button>

						<Button
							mode='contained'
							style={{
								...GS.bgSecondary,
								...GS.mb2,
							}}
							labelStyle={{ ...GS.txtCapitalize, ...GS.py1 }}
							onPress={() => onPressSignIn()}>
							Sign In
						</Button>

						<View style={{ ...GS.inlineItems, ...GS.centered }}>
							<Button
								mode='contained'
								style={STYLES.networkBtnFacebook}>
								<AntDesignIcon
									name='facebook-square'
									color={CC.light}
									size={CS.FONT_SIZE * 2}
								/>
							</Button>

							<View style={{ ...GS.mr2 }} />

							<Button
								mode='contained'
								style={STYLES.networkBtnGoogle}>
								<AntDesignIcon
									name='google'
									color={CC.light}
									size={CS.FONT_SIZE * 2}
								/>
							</Button>
						</View>
					</View>

					<View style={{ ...GS.py4, ...GS.my3, ...GS.centered }}>
						<PaperText
							style={{
								...GS.txtLower,
								color: CC.gray,
								fontSize: CS.FONT_SIZE + 3,
							}}>
							{currentLanguage.OR}{' '}
							<Text style={{ ...GS.fontBold, color: CC.light }}>
								{currentLanguage.INVITE_VIEW.BY_CODE.OR_WHAT}
							</Text>
						</PaperText>
					</View>

					<View>
						<Button
							mode='outlined'
							style={{ ...GS.py1, borderColor: CC.gray }}
							labelStyle={{
								...GS.txtCapitalize,
								color: CC.gray,
								fontSize: CS.FONT_SIZE + 3,
							}}
							onPress={onPressInvite}>
							{currentLanguage.INVITE_VIEW.BY_CODE.INVITE_CODE}
						</Button>
					</View>
				</View>
			</View>
		</View>
	);
};

export default HomeAuthScreen;
