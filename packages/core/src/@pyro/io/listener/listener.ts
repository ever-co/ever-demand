import { ObservableListener } from './observable';
import { AsyncListener } from './async';
import { ListenerType } from './types';
import { IRouter } from '../router/router';
import { routerMetadata } from '../router/metadata';
import { listenerMetadata } from './metadata';

export type Listener<T> = AsyncListener<T> | ObservableListener<T>;

export const listenerOf = (
	listenerType: ListenerType
) => (): MethodDecorator => (
	router: IRouter,
	propertyKey: string | symbol,
	descriptor
) => {
	const method = router[propertyKey];

	if (!Reflect.hasMetadata(routerMetadata.listeners, router.constructor)) {
		Reflect.defineMetadata(
			routerMetadata.listeners,
			[],
			router.constructor
		);
	}

	const listeners = Reflect.getMetadata(
		routerMetadata.listeners,
		router.constructor
	);

	listeners.push(method);

	Reflect.defineMetadata(listenerMetadata.type, listenerType, method);
};

export const getListenerType = <T>(listener: Listener<T>) => {
	return Reflect.getMetadata(listenerMetadata.type, listener);
};
