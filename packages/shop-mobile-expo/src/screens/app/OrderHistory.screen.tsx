import React from 'react';
import { View, StyleSheet } from 'react-native';

// SELECTORS
// import { useAppSelector } from '../../store/hooks';
// import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	// CONSTANT_SIZE as CS,
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
});

const OrderHistoryScreen = () => {
	// SELECTORS
	// const currentLanguage = useAppSelector(getLanguage);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle='light-content'
			/>

			<View style={STYLES.container}>
				<PaperText>Order history screen</PaperText>
			</View>
		</View>
	);
};

export default OrderHistoryScreen;
