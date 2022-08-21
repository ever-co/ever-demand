import * as React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';

import { WebView } from 'react-native-webview';

import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';
import FocusAwareStatusBar from '../../components/Common/FocusAwareStatusBar';
import CustomScreenHeader from '../../components/Common/CustomScreenHeader';

const TermsOfUseScreen = () => {
	const [useTermsHtml, setUseTermsHtml] = React.useState<string>(
		'<h1>Loading...</h1>',
	);

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
	});

	React.useEffect(() => {}, []);

	return (
		<View style={STYLES.container}>
			<FocusAwareStatusBar />
			<CustomScreenHeader>
				<View style={[GS.w100, GS.alignCenter]}>
					<Text style={STYLES.headerTitle}>Terms of use</Text>
				</View>
			</CustomScreenHeader>
			<WebView
				style={STYLES.scrollView}
				originWhitelist={['*']}
				source={{
					uri: 'https://www.iubenda.com/privacy-policy/65675001',
				}}
			/>
		</View>
	);
};

export default TermsOfUseScreen;
