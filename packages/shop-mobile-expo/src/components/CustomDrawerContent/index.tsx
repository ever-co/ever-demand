import React from "react";
import { View, ScrollViewProps } from "react-native";
import { Title } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import {
	DrawerContentScrollView,
	DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";

// HELPERS
import { isEmpty } from "../../helpers/utils";

// CONSTANTS
import { DrawerRoutesGroupType } from "../../router/drawer.routes";

// COMPONENTS
import Icon from "../Icon";
import Header from "./Header";
import Item from "./Item";

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from "../../assets/ts/styles";

// LOCAL TYPES
export type ContentProps = {
	ScrollViewProps?: ScrollViewProps;
	drawerContentProps?: DrawerContentComponentProps;
	linksGroups: DrawerRoutesGroupType[];
};

const CustomDrawer: React.FC<ContentProps> = ({
	ScrollViewProps = {},
	drawerContentProps = {},
	linksGroups = [],
}) => {
	const route = useRoute();
	return (
		<View style={{ ...GS.h100, position: "relative" }}>
			<Header />

			<SafeAreaView style={{ flex: 1 }}>
				<DrawerContentScrollView {...ScrollViewProps}>
					<View style={{ height: CS.DRAWER_HEADER_HEIGHT }} />
					{linksGroups.map((linksGroup, linksGroup_id) => (
						<View key={linksGroup_id} style={{ ...GS.mb2 }}>
							<View style={{ ...GS.inlineItems, ...GS.mb1 }}>
								{linksGroup?.icon && (
									<Icon
										name={linksGroup.icon}
										size={16}
										color={CC.grayLight}
										style={{
											...GS.mr2,
										}}
									/>
								)}
								{!isEmpty(linksGroup.title) && (
									<Title
										style={{
											...GS.ml2,
											...GS.txtCapitalize,
											fontSize: CS.FONT_SIZE,
											color: CC.gray,
										}}
									>
										{linksGroup.title}
									</Title>
								)}
							</View>
							{linksGroup?.linkItems &&
								linksGroup.linkItems.map((linkItem, linkItem_id) => (
									<Item
										key={linkItem_id}
										label={linkItem.label}
										path={linkItem.path}
										icon={linkItem.icon}
										focused={route.name === linkItem.path}
									/>
								))}
						</View>
					))}
				</DrawerContentScrollView>
			</SafeAreaView>
		</View>
	);
};

export default CustomDrawer;
