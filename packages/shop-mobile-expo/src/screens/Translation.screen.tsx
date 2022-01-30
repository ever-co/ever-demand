import React from "react";
import { View, ScrollView } from "react-native";
import { RadioButton } from "react-native-paper";

// TYPES
import type { supportedLangType } from "../store/features/translation/types";

// ACTIONS & SELECTORS
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
	getLang,
	getLanguage,
	supportedLangs,
	setLang,
} from "../store/features/translation";

// COMPONENTS
import TouchableCard from "../components/TouchableCard";
import FocusAwareStatusBar from "../components/FocusAwareStatusBar";
import PaperText from "../components/PaperText";
import CustomScreenHeader from "../components/CustomScreenHeader";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from "../assets/ts/styles";

function HomeScreen({}) {
	// ACTIONS
	const translate = useAppDispatch();

	// SELECTORS
	const currentLang = useAppSelector(getLang);
	const languages = useAppSelector(getLanguage);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="light-content"
			/>
			<CustomScreenHeader title={languages.LANGUAGE_VIEW.TITLE} showHomeBtn />

			<ScrollView
				style={{
					...GS.h100,
					...GS.pt4,
					...GS.px2,
					...GS.bgLight,
				}}
				scrollEnabled
			>
				{Object.keys(supportedLangs).map((lang: string) => {
					let L = lang as supportedLangType;

					return (
						<TouchableCard
							style={{ ...GS.inlineItems, ...GS.mb2 }}
							cardStyle={{ ...GS.w100, borderRadius: 5 }}
							cardStyleContent={{ borderRadius: 0 }}
							height={CS.FONT_SIZE_MD * 3}
							onPress={() => translate(setLang(L))}
						>
							<View style={{ ...GS.justifyContentBetween, ...GS.w100 }}>
								<PaperText
									style={{ color: CC.primary, fontSize: CS.FONT_SIZE_MD }}
								>
									{
										// @ts-ignore
										languages[lang]
									}
								</PaperText>

								<RadioButton
									status={lang === currentLang ? "checked" : "unchecked"}
									uncheckedColor={CC.primaryHightLight}
									value={lang}
									onPress={() => translate(setLang(L))}
								/>
							</View>
						</TouchableCard>
					);
				})}
			</ScrollView>
		</View>
	);
}

export default HomeScreen;
