import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// SCREENS
import Screens from '../screens';

// STYLES
import { GLOBAL_STYLE as GS } from '../assets/ts/styles';

const Drawer = createDrawerNavigator();

export default () => {
	const dimensions = useWindowDimensions();

	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName="Home"
				drawerType={dimensions.width >= 768 ? 'permanent' : 'front'}
				option={{
					header: {
						title: 'Ever',
						style: {
							...GS.centered,
							...GS.bgSecondary,
						},
					},
				}}
			>
				<Drawer.Screen name="Home" component={Screens.Home} />
			</Drawer.Navigator>
		</NavigationContainer>
	);
};
