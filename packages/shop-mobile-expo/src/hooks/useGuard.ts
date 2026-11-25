import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { guardRoute } from '../navigation/guards';
import type { RouteName } from '../navigation/types';
import { useAppStore } from '../store';

/**
 * Runs the route guard each time the screen gets focus and replaces the history with the redirect
 * target when the guard refuses (`router.navigate(...)` inside an Angular guard).
 * Returns whether the screen may show.
 */
export function useGuard(route: RouteName): boolean {
	const store = useAppStore();
	const navigation = useNavigation();

	const redirect = guardRoute(route, store.getState().session);

	useFocusEffect(
		useCallback(() => {
			const target = guardRoute(route, store.getState().session);
			if (target) {
				navigation.reset({ index: 0, routes: [{ name: target as never }] });
			}
		}, [navigation, route, store]),
	);

	return redirect == null;
}
