import React from "react";
import { Text, View, Image } from "react-native";
import { Button } from "react-native-paper";
import AntDesignIcon from "@expo/vector-icons/AntDesign";

// SELECTORS
import { useAppSelector } from "../../store/hooks";
import { getLanguage } from "../../store/features/translation";

// COMPONENTS
import { FocusAwareStatusBar, PaperText } from "../../components/Common";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from "../../assets/ts/styles";

const SignUpScreen = () => {
	// SELECTORS
	const currentLanguage = useAppSelector(getLanguage);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={false}
				backgroundColor={CC.primary}
				barStyle="light-content"
			/>

			<View
				style={{
					...GS.screen,
					...GS.bgTransparent,
					...GS.px5,
					...GS.pb5,
					...GS.mx5,
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
						style={{ ...GS.w100, height: 100, marginBottom: -20 }}
					/>
					<Text
						style={{
							...GS.txtCapitalize,
							fontSize: CS.FONT_SIZE + 1,
							opacity: 0.7,
						}}
					>
						{currentLanguage.INVITE_VIEW.BY_CODE.LOGO.DETAILS}
					</Text>
				</View>

				{/* Social Networks buttons */}
				<View style={{ ...GS.py4 }}>
					<View>
						<Button
							mode="contained"
							style={{ ...GS.bgSecondary, ...GS.py1, ...GS.mb2 }}
							labelStyle={{ ...GS.txtCapitalize }}
						>
							{currentLanguage.INVITE_VIEW.GET_IN_BY_ADDRESS}
						</Button>

						<View style={{ ...GS.inlineItems, ...GS.centered }}>
							<Button
								mode="contained"
								style={{
									...GS.bgSecondary,
									...GS.mr2,
									flex: 1,
									backgroundColor: CC.facebook,
								}}
							>
								<AntDesignIcon
									name="facebook-square"
									color={CC.light}
									size={CS.FONT_SIZE * 2}
								/>
							</Button>

							<Button
								mode="contained"
								style={{ flex: 1, backgroundColor: CC.google }}
							>
								<AntDesignIcon
									name="google"
									color={CC.light}
									size={CS.FONT_SIZE * 2}
								/>
							</Button>
						</View>
					</View>

					<View style={{ ...GS.py4, ...GS.my3, ...GS.centered }}>
						<PaperText
							style={{
								...GS.txtLower,
								color: CC.gray,
								fontSize: CS.FONT_SIZE + 3,
							}}
						>
							{currentLanguage.OR}{" "}
							<Text style={{ ...GS.fontBold, color: CC.light }}>
								{currentLanguage.INVITE_VIEW.BY_CODE.OR_WHAT}
							</Text>
						</PaperText>
					</View>

					<View>
						<Button
							mode="outlined"
							style={{ ...GS.py1, borderColor: CC.gray }}
							labelStyle={{
								...GS.txtCapitalize,
								color: CC.gray,
								fontSize: CS.FONT_SIZE + 3,
							}}
						>
							{currentLanguage.INVITE_VIEW.BY_CODE.INVITE_CODE}
						</Button>
					</View>
				</View>
			</View>
		</View>
	);
};

export default SignUpScreen;
