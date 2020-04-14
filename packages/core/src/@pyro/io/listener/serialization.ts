import { Listener } from './listener';
import { listenerMetadata } from './metadata';

export type Serializer<T, R> = (arg: T) => R;

export const serialization = <T, R>(
	serializeFunction: Serializer<T, R>
): ParameterDecorator => (
	router: object,
	propertyKey: string | symbol,
	parameterIndex: number
) => {
	const listener: Listener<T> = router[propertyKey];

	if (!Reflect.hasMetadata(listenerMetadata.serializers, listener)) {
		Reflect.defineMetadata(listenerMetadata.serializers, [], listener);
	}

	Reflect.getMetadata(listenerMetadata.serializers, listener)[
		parameterIndex
	] = serializeFunction;
};

export const getListenerSerializer = <T>(
	listener: Listener<T>
): ((args: any[]) => any[]) => {
	const serializers: Array<Serializer<any, any>> = Reflect.getMetadata(
		listenerMetadata.serializers,
		listener
	);
	if (serializers == null) {
		return (args) => args;
	}

	return (args: any[]) => {
		return args.map((arg, i) =>
			serializers[i] != null ? serializers[i](arg) : arg
		);
	};
};
