import * as React from 'react';
import {
	Text,
	View,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Linking,
} from 'react-native';
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';
import FocusAwareStatusBar from '../../components/Common/FocusAwareStatusBar';
import CustomScreenHeader from '../../components/Common/CustomScreenHeader';

const PrivacyScreen = () => {
	const STYLES = StyleSheet.create({
		container: {
			...GS.screen,
		},
		headerTitle: {
			...GS.fontBold,
			fontSize: CS.FONT_SIZE_MD + 2,
		},
		scrollView: {
			...GS.h100,
			...GS.pt4,
			...GS.px2,
		},
		titleText: {
			fontSize: CS.FONT_SIZE_MD,
			fontWeight: 'bold',
		},
		text: {
			color: CC.gray,
			...GS.mt2,
		},
		wrapLinkText: {
			...GS.mt2,
			...GS.ml1,
		},
	});

	const linkToFullPrivacy = () => {
		Linking.openURL('https://www.iubenda.com/privacy-policy/7927924').catch(
			(err) => console.error('An error occurred', err),
		);
	};

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar />
			<CustomScreenHeader>
				<View style={[GS.w100, GS.alignCenter]}>
					<Text style={STYLES.headerTitle}>Privacy</Text>
				</View>
			</CustomScreenHeader>
			<ScrollView style={STYLES.scrollView}>
				<View style={GS.row}>
					<Text style={STYLES.text}>
						Full Privacy Policy of Ever available
					</Text>
					<TouchableOpacity
						style={STYLES.wrapLinkText}
						onPress={linkToFullPrivacy}>
						<Text>here</Text>
					</TouchableOpacity>
				</View>

				<Text style={[STYLES.text, STYLES.titleText]}>
					Data Controller and Owner
				</Text>
				<Text style={STYLES.text}>Ever Co. LTD,</Text>
				<Text style={STYLES.text}>
					HaAtsmaut 38/3, Ashdod 77452, Israel,
				</Text>
				<Text style={STYLES.text}>ever@ever.co</Text>
			</ScrollView>
		</View>
	);
};

export default PrivacyScreen;
