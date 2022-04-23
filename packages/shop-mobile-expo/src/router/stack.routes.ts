import { createNativeStackNavigator } from '@react-navigation/native-stack';

// TYPES
import { GroupNameType } from '../store/features/navigation/types';

// UTILS
import { getReactComponentProps } from '../helpers/utils';

// SCREENS
import DrawerNavigator from './DrawerNavigator';
import SCREENS from '../screens/index';

const STACK_SCREEN = createNativeStackNavigator().Screen;
const STACK_SCREEN_PROPS = getReactComponentProps(STACK_SCREEN);

// LOCAL TYPES
export type StackScreenType = typeof STACK_SCREEN_PROPS;
export type StackScreenGroupType = {
	[name in GroupNameType]: StackScreenType[];
};

const STACK_ROUTES_GROUPS: StackScreenGroupType = {
	APP: [
		{
			name: 'STACK/HOME',
			component: DrawerNavigator,
		},
	],
	BLANK: [
		{
			name: 'STACK/BLANK_',
			component: SCREENS.BLANK_,
		},
	],
	LOADING: [
		{
			name: 'STACK/LOADING',
			component: SCREENS.LOADING,
		},
	],
	REGISTRATION: [
		{
			name: 'STACK/HOME',
			component: SCREENS.REGISTRATION.HOME,
		},
		{
			name: 'STACK/SIGN_UP',
			component: SCREENS.REGISTRATION.SIGN_UP,
		},
		{
			name: 'STACK/SIGN_IN',
			component: SCREENS.REGISTRATION.SIGN_IN,
		},
		{
			name: 'STACK/SIGN_UP_BY_ADDRESS',
			component: SCREENS.REGISTRATION.SIGN_UP_BY_ADDRESS,
		},
	],
};

export default STACK_ROUTES_GROUPS;
