import * as React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// COMPONENTS
import PaperText from "../PaperText";

// SELECTORS
import { useAppSelector } from "../../store/hooks";
import { getLanguage } from "../../store/features/translation";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from "../../assets/ts/styles";

const DrawerHeader = () => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	return (
		<SafeAreaView
			style={{
				...GS.bgSecondary,
				...GS.shadow,
				...GS.w100,
				position: "absolute",
				borderBottomStartRadius: CS.SPACE_SM,
				borderBottomEndRadius: CS.SPACE_SM,
			}}
		>
			<View
				style={{
					...GS.centered,
					height: CS.DRAWER_HEADER_HEIGHT,
				}}
			>
				<PaperText
					style={{ ...GS.fontBold, color: CC.light, fontSize: CS.FONT_SIZE_MD }}
				>
					{LANGUAGE.SIDE_MENU.TITLE}
				</PaperText>
			</View>
		</SafeAreaView>
	);
};

export default DrawerHeader;
