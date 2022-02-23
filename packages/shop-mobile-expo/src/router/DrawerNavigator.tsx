import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// TYPES
import DRAWER_ROUTES, { DrawerRoutesGroupType } from './drawer.routes';

// SELECTORS
import { useAppSelector } from '../store/hooks';
import { getLanguage } from '../store/features/translation';

// COMPONENTS
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigator: React.FC = () => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// DATA
	const dimensions = useWindowDimensions();
	const ROUTES_GROUPS: DrawerRoutesGroupType[] = [
		{
			title: LANGUAGE.SIDE_MENU.GROUPS.STORE.STORE_TITLE,
			linkItems: [
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.NO_TITLE.ITEMS.PRODUCTS,
					path: 'DRAWER/HOME',
					icon: 'shopping-bag',
				},
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.NO_TITLE.ITEMS
						.ORDER_HISTORY,
					path: 'DRAWER/ORDER_HISTORY',
					icon: 'shopping-cart',
				},
			],
		},

		{
			title: LANGUAGE.SIDE_MENU.GROUPS.SETTINGS.DIVER_TITLE,
			linkItems: [
				{
					label: 'Account & Preferences',
					path: 'DRAWER/ACCOUNT',
					icon: 'user',
				},
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.SETTINGS.ITEMS.LANGUAGE,
					path: 'DRAWER/TRANSLATION',
					icon: 'align-center',
				},
			],
		},

		{
			title: LANGUAGE.SIDE_MENU.GROUPS.INFO.DIVER_TITLE,
			linkItems: [
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.INFO.ITEMS.FAQ,
					path: 'https://google.com',
					icon: 'help-circle',
					external: true,
				},
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.NO_TITLE.ITEMS.CALL_US,
					path: 'https://google.com',
					icon: 'phone',
					external: true,
				},
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.INFO.ITEMS.ABOUT_US,
					path: 'https://google.com',
					icon: 'info',
					external: true,
				},
			],
		},

		{
			title: LANGUAGE.SIDE_MENU.GROUPS.LEGALS.DIVER_TITLE,
			linkItems: [
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.LEGALS.ITEMS.PRIVACY,
					path: 'https://google.com',
					icon: 'lock',
					external: true,
				},
				{
					label: LANGUAGE.SIDE_MENU.GROUPS.LEGALS.ITEMS.TERMS_OF_USE,
					path: 'https://google.com',
					icon: 'list',
					external: true,
				},
			],
		},
	];

	return (
		<Drawer.Navigator
			initialRouteName='Home'
			defaultStatus='open'
			drawerType={dimensions.width >= 768 ? 'permanent' : 'front'}
			drawerContent={(props: any) => (
				<CustomDrawerContent
					drawerContentProps={props}
					linksGroups={ROUTES_GROUPS}
				/>
			)}>
			{DRAWER_ROUTES.map((stackScreenProps, id) => (
				<Drawer.Screen key={id} {...stackScreenProps} />
			))}
		</Drawer.Navigator>
	);
};

export default DrawerNavigator;
