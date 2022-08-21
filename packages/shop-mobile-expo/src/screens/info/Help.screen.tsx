import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// COMPONENTS
import CustomScreenHeader from '../../components/Common/CustomScreenHeader';
import FocusAwareStatusBar from '../../components/Common/FocusAwareStatusBar';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

const HelpScreen = () => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	const STYLES = StyleSheet.create({
		container: {
			...GS.screen,
		},
		scrollView: {
			...GS.h100,
			...GS.pt4,
			...GS.px2
		},
		mainTitle: {
			...GS.fontBold,
			color: CC.light,
			fontSize:CS.FONT_SIZE_XLG
		},
	});

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<CustomScreenHeader title={LANGUAGE.HELP_VIEW.TITLE} />
			<ScrollView
				style={STYLES.scrollView}
				overScrollMode='never'
				showsVerticalScrollIndicator={false}>
				<Text style={STYLES.mainTitle}>{"Help Content Coming soon :)("}</Text>
			</ScrollView>
		</View>
	);
};

export default HelpScreen;
