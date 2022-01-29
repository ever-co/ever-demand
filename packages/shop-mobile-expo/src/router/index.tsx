import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// HOOKS
import { useAppSelector, useAppDispatch } from "../store/hooks";

// ACTIONS & SELECTORS
import { getGroup, setGroup } from "../store/features/navigation";

// ROUTING
import NAV_GROUPS from "./groups.routes";
import STACK_ROUTES from "./stack.routes";

const Stack = createNativeStackNavigator();

// NAVIGATION COMPONENT
const Router = ({}) => {
	// ACTIONS
	const setNavGroup = useAppDispatch();

	// SELECTORS
	const getNavGroup = useAppSelector(getGroup);

	// EFFECTS
	React.useEffect(() => {
		setTimeout(() => {
			setNavGroup(setGroup(NAV_GROUPS.APP));
		}, 3000);
		return () => {};
	}, []);

	const Routes = () => {
		const safeGroup = getNavGroup || "BLANK";
		return (
			<>
				{STACK_ROUTES[safeGroup].map((stackScreenProps, id) => (
					<Stack.Screen key={id} {...stackScreenProps} />
				))}
			</>
		);
	};

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
					presentation: "card",
				}}
				defaultScreenOptions={{ presentation: "card" }}
			>
				{Routes()}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default Router;
