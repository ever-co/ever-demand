import React from "react";
import { View } from "react-native";
// SELECTORS
import { useAppSelector } from "../store/hooks";
import { getLanguage } from "../store/features/translation";

// COMPONENTS
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import PaperText from "../components/PaperText";

// STYLES
import { GLOBAL_STYLE as GS } from "../assets/ts/styles";
import { ScrollView } from "react-native-gesture-handler";
import CustomScreenHeader from "../components/CustomScreenHeader";

function HomeScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<CustomScreenHeader title={LANGUAGE.PRODUCTS_VIEW.TITLE} showControls />

			<ScrollView style={{ ...GS.h100, ...GS.pt3 }}>
				<PaperText>No data</PaperText>
			</ScrollView>
		</View>
	);
}

export default HomeScreen;
