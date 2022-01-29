import * as React from "react";
import { View } from "react-native";
import { DrawerItem } from "@react-navigation/drawer";

// TYPES
import { DrawerLinkItem } from "../../router/drawer.routes";

// COMPONENTS
import TouchableCard from "../TouchableCard";
import Icon from "../Icon";
import PaperText from "../PaperText";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from "../../assets/ts/styles";

const Item: React.FC<DrawerLinkItem> = ({ label, path, icon, external }) => {
	return (
		<TouchableCard
			style={{ ...GS.w100, ...GS.inlineItems, ...GS.mb1 }}
			cardStyle={{ ...GS.w100, ...GS.px0, borderRadius: 0 }}
			cardStyleContent={{ ...GS.px2 }}
			height={50}
			rippleColor={CC.secondaryHighLight + "3f"}
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
			titleStyle={{ color: CC.primaryLight, fontSize: CS.FONT_SIZE }}
			onPress={() => {
				return console.log("Function not implemented.");
			}}
		/>
	);
};

export default Item;
