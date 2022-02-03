import React from "react";
import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// SELECTORS
import { useAppSelector } from "../../store/hooks";
import { getLanguage } from "../../store/features/translation";

// COMPONENTS
import { FocusAwareStatusBar } from "../../components/Common";

// STYLES
import { GLOBAL_STYLE as GS } from "../../assets/ts/styles";

const SignUpScreen = () => {
	// SELECTORS
	const getCurrentLanguage = useAppSelector(getLanguage);

	return (
		<SafeAreaView style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>

			<View
				style={{
					...GS.screen,
					...GS.bgTransparent,
					zIndex: 1,
				}}
			>
				{/*  Title logo */}
				<View
					style={{
						...GS.centered,
						flex: 1,
					}}
				>
					<Image
						source={require("../../assets/img/ever/logo.png")}
						resizeMode="contain"
						style={{ ...GS.w100, height: 100, marginBottom: -10 }}
					/>
					<Text style={{ ...GS.txtCapitalize }}>
						{getCurrentLanguage.INVITE_VIEW.BY_CODE.LOGO.DETAILS}
					</Text>
				</View>

				{/* Social Networks buttons */}
				<View style={{ ...GS.py4 }}></View>
			</View>
		</SafeAreaView>
	);
};

export default SignUpScreen;
