import React from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { version, name } from '../../package.json';

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from '../components/Common';

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from '../assets/ts/styles';

export default function Blank_Screen() {
	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				barStyle="dark-content"
				translucent={true}
				backgroundColor="transparent"
			/>

			<View style={STYLES.main}>
				<PaperText style={STYLES.title}>☹</PaperText>
				<PaperText style={STYLES.subTitle}>Something wrong</PaperText>
				<Button
					mode="text"
					uppercase={false}
					onPress={() => BackHandler.exitApp()}>
					Close app
				</Button>
			</View>
			<View style={STYLES.footer}>
				<PaperText style={STYLES.appInfo}>
					{name} - v{version}
				</PaperText>
			</View>
		</View>
	);
}

const STYLES = StyleSheet.create({
	main: {
		...GS.centered,
		...GS.px4,
		flex: 1,
	},
	title: { ...GS.mb3, fontSize: 40 },
	subTitle: {
		...GS.txtCenter,
		...GS.mb2,
		color: CC.gray,
		fontSize: 16,
	},
	footer: { ...GS.py2, ...GS.px4, alignItems: 'flex-end' },
	appInfo: {
		...GS.txtCenter,
		color: CC.gray,
		fontSize: 12,
	},
});
