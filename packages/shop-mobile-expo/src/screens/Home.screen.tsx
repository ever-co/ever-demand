import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

// COMPONENTS
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import PaperText from "../components/PaperText";

// STYLES
import { GLOBAL_STYLE as GS } from "../assets/ts/styles";

function HomeScreen({}) {
	return (
		<View style={{ ...GS.screen, ...GS.centered }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<PaperText>Welcome to your new app build with</PaperText>
			<PaperText>
				Typescript / Expo / Paper / React Navigation / Redux
			</PaperText>
		</View>
	);
}

export default HomeScreen;
