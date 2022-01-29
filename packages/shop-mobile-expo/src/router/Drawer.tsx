import * as React from "react";
import { useWindowDimensions } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";

// SCREENS
import SCREENS from "../screens";

// ROUTES
import ROUTES_GROUPS from "./drawer.routes";

// COMPONENTS
import CustomDrawer from "../components/Drawer";

const Drawer = createDrawerNavigator();

const DrawerNavigation: React.FC = () => {
	const dimensions = useWindowDimensions();

	return (
		<Drawer.Navigator
			initialRouteName="Home"
			defaultStatus="open"
			drawerType={dimensions.width >= 768 ? "permanent" : "front"}
			drawerContent={(props: any) => (
				<CustomDrawer drawerContentProps={props} linksGroups={ROUTES_GROUPS} />
			)}
		>
			<Drawer.Screen name="Home" component={SCREENS.Home} />
		</Drawer.Navigator>
	);
};

export default DrawerNavigation;
