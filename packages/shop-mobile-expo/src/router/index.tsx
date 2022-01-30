import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// HOOKS
import { useAppSelector, useAppDispatch } from "../store/hooks";

// ACTIONS & SELECTORS
import { getLang } from "../store/features/translation";
import { getGroup, setGroup } from "../store/features/navigation";

// ROUTING
import NAV_GROUPS from "./groups.routes";
import STACK_ROUTES from "./stack.routes";

// STYLES
import { GLOBAL_STYLE as GS } from "../assets/ts/styles";

const Stack = createNativeStackNavigator();

// NAVIGATION COMPONENT
const Router = ({}) => {
	// ACTIONS
	const setNavGroup = useAppDispatch();

	// SELECTORS
	const getNavGroup = useAppSelector(getGroup);
	const getCurrentLang = useAppSelector(getLang);

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
		<View
			style={{
				...GS.w100,
				...GS.h100,
				transform: getCurrentLang === "HEBREW" ? [{ scaleX: -1 }] : [],
			}}
		>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
						presentation: "card",
						contentStyle: {
							...GS.bgPrimary,
						},
					}}
					defaultScreenOptions={{ presentation: "card" }}
				>
					{Routes()}
				</Stack.Navigator>
			</NavigationContainer>
		</View>
	);
};

export default Router;
