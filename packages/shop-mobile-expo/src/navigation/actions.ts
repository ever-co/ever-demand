import { CommonActions } from '@react-navigation/native';
import { navigationRef, type RootParamList, type RouteName } from './types';

type ParamsOf<T extends RouteName> = RootParamList[T];

/** `navCtrl.navigateRoot(...)`: replaces the history with one route. */
export function navigateRoot<T extends RouteName>(name: T, ...params: ParamsOf<T> extends undefined ? [] : [ParamsOf<T>]): void {
	if (!navigationRef.isReady()) {
		return;
	}
	navigationRef.dispatch(
		CommonActions.reset({ index: 0, routes: [{ name, params: params[0] as object | undefined }] }),
	);
}

export function navigate<T extends RouteName>(name: T, ...params: ParamsOf<T> extends undefined ? [] : [ParamsOf<T>]): void {
	if (!navigationRef.isReady()) {
		return;
	}
	navigationRef.dispatch(CommonActions.navigate({ name, params: params[0] as object | undefined }));
}

/** `location.back()`, or the products when there is no history. */
export function goBack(fallback: RouteName = 'Products'): void {
	if (!navigationRef.isReady()) {
		return;
	}
	if (navigationRef.canGoBack()) {
		navigationRef.goBack();
	} else {
		navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: fallback }] }));
	}
}
