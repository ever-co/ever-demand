/**
 * Jest stand-in for `@react-navigation/drawer`: the real drawer animates with Reanimated 4, whose
 * Jest mock needs native modules. This navigator uses the same `DrawerRouter`, renders the focused
 * screen and, while open, the drawer content, so screens and the side menu can be tested.
 */
import {
	createNavigatorFactory,
	DrawerRouter,
	useNavigationBuilder,
	type DefaultNavigatorOptions,
	type DrawerNavigationState,
	type ParamListBase,
} from '@react-navigation/native';
import { createElement, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

type Props = DefaultNavigatorOptions<ParamListBase, string | undefined, DrawerNavigationState<ParamListBase>, object, object, unknown> & {
	drawerContent?: (props: unknown) => ReactNode;
	backBehavior?: 'history' | 'initialRoute' | 'firstRoute' | 'order' | 'none';
	initialRouteName?: string;
};

function MockDrawerNavigator({ initialRouteName, children, screenOptions, drawerContent, backBehavior }: Props) {
	const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder(DrawerRouter as never, {
		initialRouteName,
		children,
		screenOptions,
		backBehavior,
	} as never);
	const typedState = state as unknown as DrawerNavigationState<ParamListBase>;
	const focused = typedState.routes[typedState.index];
	const isOpen = typedState.history.some((entry) => (entry as { type?: string }).type === 'drawer');

	return createElement(
		NavigationContent,
		null,
		createElement(View, { style: { flex: 1 }, testID: `screen-${focused.name}` }, descriptors[focused.key].render()),
		isOpen && drawerContent
			? createElement(View, { testID: 'drawer-open' }, drawerContent({ state: typedState, navigation, descriptors }))
			: null,
	);
}

export const createDrawerNavigator = createNavigatorFactory(MockDrawerNavigator as never) as unknown as () => {
	Navigator: (props: object) => ReactNode;
	Screen: (props: object) => ReactNode;
};

export function DrawerContentScrollView({ children, ...props }: { children?: ReactNode }) {
	return createElement(ScrollView, props, children);
}
