import { createDrawerNavigator } from "@react-navigation/drawer";

// TYPES
import type { IconNameType } from "../components/Icon";

// HELPERS
import { getReactComponentProps } from "../helpers/utils";

// SCREENS
import SCREENS from "../screens";

const DrawerScreen = createDrawerNavigator().Screen;
const DrawerScreenProps = getReactComponentProps(DrawerScreen);

// LOCAL TYPES
export type DrawerLinkItem = {
	label: string;
	path: string;
	icon?: IconNameType;
	external?: boolean;
	focused?: boolean;
};
export type DrawerRoutesGroupType = {
	title: string;
	icon?: IconNameType;
	linkItems?: DrawerLinkItem[];
};
export type DrawerScreenType = typeof DrawerScreenProps;

const DRAWER_ROUTES: DrawerScreenType[] = [
	{
		name: "DRAWER/HOME",
		component: SCREENS.Home,
	},
];

export default DRAWER_ROUTES;
