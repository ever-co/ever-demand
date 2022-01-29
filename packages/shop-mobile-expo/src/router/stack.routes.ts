import { createNativeStackNavigator } from "@react-navigation/native-stack";

// TYPES
import { GroupNameType } from "../store/features/navigation/types";

// UTILS
import { getReactComponentProps } from "../helpers/utils";

// SCREENS
import DrawerNavigator from "./DrawerNavigator";
import SCREENS from "../screens/index";

const StackScreen = createNativeStackNavigator().Screen;
const StackScreenProps = getReactComponentProps(StackScreen);

// LOCAL TYPES
export type StackScreenType = typeof StackScreenProps;
export type StackScreenGroupType = {
	[name in GroupNameType]: StackScreenType[];
};

const STACK_ROUTES_GROUPS: StackScreenGroupType = {
	APP: [
		{
			name: "STACK/HOME",
			component: DrawerNavigator,
		},
	],
	BLANK: [
		{
			name: "STACK/BLANK_",
			component: SCREENS.Blank_,
		},
	],
	LOADING: [
		{
			name: "STACK/LOADING",
			component: SCREENS.Loading,
		},
	],
};

export default STACK_ROUTES_GROUPS;
