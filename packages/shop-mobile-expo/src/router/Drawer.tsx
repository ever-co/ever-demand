import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// SCREENS
import SCREENS from '../screens';

// ROUTES
import ROUTES_GROUPS from './drawer.routes';

// COMPONENTS
import CustomDrawer from '../components/Drawer';

// STYLES
import { GLOBAL_STYLE as GS } from '../assets/ts/styles';

const Drawer = createDrawerNavigator();

const DrawerNavigation: React.FC = () => {
	const dimensions = useWindowDimensions();

	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName="Home"
				detach
				option={{
					header: {
						title: 'Ever',
						style: {
							...GS.centered,
							...GS.bgSecondary,
						},
					},
				}}
				drawerType={dimensions.width >= 768 ? 'permanent' : 'front'}
				drawerContent={(props: any) => (
					<CustomDrawer
						drawerContentProps={props}
						linksGroups={ROUTES_GROUPS}
					/>
				)}
			>
				<Drawer.Screen name="Home" component={SCREENS.Home} />
			</Drawer.Navigator>
		</NavigationContainer>
	);
};

export default DrawerNavigation;
