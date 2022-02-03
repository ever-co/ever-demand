import React from "react";
import { Text } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// COMPONENTS
import FocusAwareStatusBar from "../../components/FocusAwareStatusBar";

const SignUpScreen = () => {
	return (
		<SafeAreaView>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<Text>Sign Up</Text>
		</SafeAreaView>
	);
};

export default SignUpScreen;
