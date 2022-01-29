import * as React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// COMPONENTS
import PaperText from "../PaperText";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from "../../assets/ts/styles";

const DrawerHeader = () => {
	return (
		<SafeAreaView
			style={{
				...GS.bgSecondary,
				...GS.shadow,
				borderBottomStartRadius: CS.SPACE,
				borderBottomEndRadius: CS.SPACE,
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
					Ever Shop
				</PaperText>
			</View>
		</SafeAreaView>
	);
};

export default DrawerHeader;
