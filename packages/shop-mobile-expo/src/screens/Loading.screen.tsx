import React from "react";
import { View, ActivityIndicator } from "react-native";

// STYLES
import { GLOBAL_STYLE as GS, CONSTANT_COLOR as CC } from "../assets/ts/styles";
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";

export default ({}) => {
	// STATES

	return (
		<View style={{ ...GS.screen, ...GS.centered }}>
			<FocusAwareStatusBar
				barStyle="light-content"
				translucent={true}
				backgroundColor="transparent"
			/>

			<ActivityIndicator size="large" color={CC.light} />
		</View>
	);
};
