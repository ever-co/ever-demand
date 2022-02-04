import React from 'react';
import { View, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
// import AntDesignIcon from '@expo/vector-icons/AntDesign';

// SELECTORS
// import { useAppSelector } from '../../store/hooks';
// import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import { FocusAwareStatusBar } from '../../components/Common';

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

const SignUpByAddressScreen = () => {
	// SELECTORS
	// const currentLanguage = useAppSelector(getLanguage);

	// NAVIGATIOn
	// const navigation = useNavigation();

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			<View style={STYLES.container} />
		</View>
	);
};

export default SignUpByAddressScreen;
