import { createDrawerNavigator } from '@react-navigation/drawer';

// TYPES
import type { IconNameType } from '../components/Common/Icon';

// HELPERS
import { getReactComponentProps } from '../helpers/utils';

// SCREENS
import SCREENS from '../screens';

const DrawerScreen = createDrawerNavigator().Screen;
const DrawerScreenProps = getReactComponentProps(DrawerScreen);

// LOCAL TYPES
export interface DrawerLinkItem {
	label: string;
	path: string;
	icon?: IconNameType;
	external?: boolean;
	focused?: boolean;
}
export interface DrawerRoutesGroupType {
	title: string;
	icon?: IconNameType;
	linkItems?: DrawerLinkItem[];
}
export type DrawerScreenType = typeof DrawerScreenProps;

const DRAWER_ROUTES: DrawerScreenType[] = [
	{
		name: 'DRAWER/HOME',
		component: SCREENS.APP.Home,
	},
	{
		name: 'DRAWER/ORDER_HISTORY',
		component: SCREENS.APP.OrderHistory,
	},
	{
		name: 'DRAWER/ACCOUNT',
		component: SCREENS.APP.Account,
	},
	{
		name: 'DRAWER/TRANSLATION',
		component: SCREENS.APP.Translation,
	},
	{
		name: 'DRAWER/MERCHANTS_SEARCH',
		component: SCREENS.APP.MerchantsSearch,
	},
];

export default DRAWER_ROUTES;
