import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// HOOKS
import { useAppSelector, useAppDispatch } from '../store/hooks';

// ACTIONS & SELECTORS
import { getGroup, setGroup } from '../store/features/navigation';

// CONSTANTS
import NAV_GROUPS from '../store/features/navigation/groups';

// SCREENS
import DrawerNavigation from './Drawer';
import Screens from '../screens';

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
		switch (getNavGroup) {
			case NAV_GROUPS.LOADING:
				return (
					<Stack.Screen
						name="Stack/Loading"
						component={Screens.Loading}
					/>
				);
			case NAV_GROUPS.APP:
				return <DrawerNavigation />;
			default:
				return (
					<Stack.Screen
						name="Stack/Blank_"
						component={Screens.Blank_}
					/>
				);
		}
	};

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
					presentation: 'card',
				}}
				defaultScreenOptions={{ presentation: 'card' }}
			>
				{Routes()}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default Router;
