/**
 * Navigation: one drawer (the side menu) holding every page, with the Ionic URLs as web paths
 * (`/invite/by-code`, `/products`, `/order-info`, ...). The menu sits on the right in Hebrew.
 */
import NetInfo from '@react-native-community/netinfo';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';
import { isRtl } from '../i18n';
import { ModalHost } from '../modals/ModalHost';
import { InviteByCodeScreen } from '../screens/InviteByCodeScreen';
import { InviteByLocationScreen } from '../screens/InviteByLocationScreen';
import { MerchantsScreen } from '../screens/MerchantsScreen';
import { OrderInfoScreen, OrderTakeawayInfoScreen } from '../screens/OrderInfoScreens';
import { OrderDetailsScreen, OrdersHistoryScreen } from '../screens/OrdersHistoryScreens';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import {
	AboutScreen,
	ConnectionLostScreen,
	HelpScreen,
	LanguageScreen,
	MaintenanceScreen,
	PrivacyScreen,
	ServerDownScreen,
	TermsOfUseScreen,
} from '../screens/SimpleScreens';
import { useAppDispatch, useAppSelector } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';
import { goBack, navigate } from './actions';
import { DrawerContent } from './DrawerContent';
import { navigationRef, type RootParamList, type RouteName } from './types';

const Drawer = createDrawerNavigator<RootParamList>();

function appUrlPrefix(): string {
	try {
		return Linking.createURL('/');
	} catch {
		// No manifest (tests): the scheme of app.config.ts.
		return 'evershop://';
	}
}

export const linking: LinkingOptions<RootParamList> = {
	prefixes: [appUrlPrefix()],
	config: {
		screens: {
			InviteByCode: 'invite/by-code',
			InviteByLocation: 'invite/by-location',
			Products: 'products',
			ProductDetails: 'products/product-details/:id',
			OrdersHistory: 'orders-history',
			OrderDetails: 'orders-history/:id',
			OrderInfo: 'order-info',
			OrderTakeawayInfo: 'order-info-takeaway',
			Merchants: 'merchants',
			Language: 'language',
			About: 'info/about',
			Help: 'info/help',
			Privacy: 'info/privacy',
			TermsOfUse: 'info/terms-of-use',
			ConnectionLost: 'errors/connection-lost',
			ServerDown: 'server-down',
			Maintenance: 'maintenance-info',
		},
	},
};

const theme = {
	...DarkTheme,
	colors: { ...DarkTheme.colors, background: colors.primary, card: colors.primary, primary: colors.secondary },
};

/** No swipe-open menu on the first-run and error pages. */
const NO_MENU: ReadonlyArray<RouteName> = ['InviteByCode', 'InviteByLocation', 'ConnectionLost', 'ServerDown', 'Maintenance'];

/** Network lost → connection-lost page; back where it was when the network returns. */
function useNetworkWatcher() {
	const dispatch = useAppDispatch();
	const offline = useRef(false);
	useEffect(
		() =>
			NetInfo.addEventListener((state) => {
				const online = state.isConnected !== false;
				dispatch(uiActions.setOnline(online));
				if (!online && !offline.current) {
					offline.current = true;
					navigate('ConnectionLost');
				} else if (online && offline.current) {
					offline.current = false;
					goBack();
				}
			}),
		[dispatch],
	);
}

export function RootNavigator({ initialRouteName }: { initialRouteName: RouteName }) {
	const language = useAppSelector((state) => state.session.language);
	useNetworkWatcher();

	return (
		<NavigationContainer ref={navigationRef} linking={linking} theme={theme} documentTitle={{ formatter: () => 'Ever Shop' }}>
			<Drawer.Navigator
				initialRouteName={initialRouteName}
				backBehavior='history'
				drawerContent={(props) => <DrawerContent {...props} />}
				screenOptions={({ route }) => ({
					headerShown: false,
					drawerPosition: isRtl(language) ? 'right' : 'left',
					swipeEnabled: !NO_MENU.includes(route.name),
					drawerStyle: { backgroundColor: colors.primary },
					sceneStyle: { backgroundColor: colors.primary },
				})}>
				<Drawer.Screen name='InviteByCode' component={InviteByCodeScreen} />
				<Drawer.Screen name='InviteByLocation' component={InviteByLocationScreen} />
				<Drawer.Screen name='Products' component={ProductsScreen} />
				<Drawer.Screen name='ProductDetails' component={ProductDetailsScreen} />
				<Drawer.Screen name='OrdersHistory' component={OrdersHistoryScreen} />
				<Drawer.Screen name='OrderDetails' component={OrderDetailsScreen} />
				<Drawer.Screen name='OrderInfo' component={OrderInfoScreen} />
				<Drawer.Screen name='OrderTakeawayInfo' component={OrderTakeawayInfoScreen} />
				<Drawer.Screen name='Merchants' component={MerchantsScreen} />
				<Drawer.Screen name='Language' component={LanguageScreen} />
				<Drawer.Screen name='About' component={AboutScreen} />
				<Drawer.Screen name='Help' component={HelpScreen} />
				<Drawer.Screen name='Privacy' component={PrivacyScreen} />
				<Drawer.Screen name='TermsOfUse' component={TermsOfUseScreen} />
				<Drawer.Screen name='ConnectionLost' component={ConnectionLostScreen} />
				<Drawer.Screen name='ServerDown' component={ServerDownScreen} />
				<Drawer.Screen name='Maintenance' component={MaintenanceScreen} />
			</Drawer.Navigator>
			<ModalHost />
		</NavigationContainer>
	);
}
