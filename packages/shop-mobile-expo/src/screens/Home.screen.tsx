import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

// COMPONENTS
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import PaperText from "../components/PaperText";

// STYLES
import { GLOBAL_STYLE as GS } from "../assets/ts/styles";
import { ScrollView } from "react-native-gesture-handler";
import CustomScreenHeader from "../components/CustomScreenHeader";

function HomeScreen({}) {
	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<CustomScreenHeader title="Home" showControls />

			<ScrollView style={{ ...GS.h100, ...GS.pt3 }}>
				<PaperText>Welcome to your new app build with</PaperText>
				<PaperText>
					Typescript / Expo / Paper / React Navigation / Redux
				</PaperText>
			</ScrollView>
		</View>
	);
}

export default HomeScreen;
