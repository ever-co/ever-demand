import * as React from "react";
import { View, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";

// TYPES
import { DrawerLinkItem } from "../../router/drawer.routes";

// COMPONENTS
import { TouchableCard } from "../Common";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from "../../assets/ts/styles";

const Item: React.FC<DrawerLinkItem> = ({
	label,
	path,
	icon,
	external,
	focused,
}) => {
	const navigation = useNavigation();
	return (
		<View style={{ position: "relative", ...GS.w100, ...GS.mb1 }}>
			<TouchableCard
				style={{ ...GS.w100, ...GS.inlineItems, zIndex: 1 }}
				cardStyle={{ ...GS.w100, ...GS.px0, borderRadius: 0 }}
				cardStyleContent={{
					...GS.px2,
					backgroundColor: focused
						? CC.primaryHightLight + "20"
						: "transparent",
				}}
				height={50}
				rippleColor={CC.primaryHightLight + "3f"}
				iconProps={
					icon
						? {
								color: CC.primaryHightLight,
								size: CS.FONT_SIZE * 1.5,
								name: icon,
								// TODO: think to use this feature (below e.g)
								//focused ? 'heart' : 'heart-outline'
						  }
						: undefined
				}
				title={label}
				titleStyle={{
					color: focused ? CC.primary : CC.primaryLight,
					fontSize: CS.FONT_SIZE,
				}}
				onPress={() => {
					if (external) return Linking.openURL(path);
					// @ts-ignore TODO: search to resolve this next line
					navigation.navigate({ name: path });
					console.log(path);
				}}
			/>

			{focused && (
				<View
					style={{
						...GS.h100,
						...GS.bgSecondary,
						position: "absolute",
						top: 0,
						left: 0,
						width: 4,
						borderTopEndRadius: 4,
						borderBottomEndRadius: 4,
						zIndex: 2,
					}}
				/>
			)}
		</View>
	);
};

export default Item;
