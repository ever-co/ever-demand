import { createNativeStackNavigator } from '@react-navigation/native-stack';

// TYPES
import { GroupNameType } from '../store/features/navigation/types';

// UTILS
import { getReactComponentProps } from '../helpers/utils';

// SCREENS
import SCREENS from '../screens/index';

const StackScreen = createNativeStackNavigator().Screen;
const StackScreenProps = getReactComponentProps(StackScreen);

// LOCAL TYPES
export type ScreenType = typeof StackScreenProps;
export type ScreenGroupType = {
	[name in GroupNameType]: ScreenType[];
};

const ROUTES_GROUPS: ScreenGroupType = {
	APP: [],
	BLANK: [
		{
			name: 'STACK/BLANK_',
			component: SCREENS.Blank_,
		},
	],
	LOADING: [
		{
			name: 'STACK/LOADING',
			component: SCREENS.Loading,
		},
	],
};

export default ROUTES_GROUPS;
