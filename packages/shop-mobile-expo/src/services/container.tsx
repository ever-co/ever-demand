/**
 * The app's service objects (the Angular DI singletons), created once and passed down by context
 * so screens and tests can swap any of them.
 */
import type { ApolloClient } from '@apollo/client';
import React, { createContext, useContext } from 'react';
import { Linking, Platform } from 'react-native';
import { env as defaultEnv, type Environment } from '../config/env';
import type { DevicePlatform } from '../domain/enums';
import { createGraphQLApi, type GraphQLApi } from '../graphql/api';
import { createApolloClient } from '../graphql/client';
import { RpcClient } from '../rpc/client';
import { createRouters, type Routers } from '../rpc/routers';
import { createLocationService, type LocationService } from './location';

export interface Services {
	env: Environment;
	routers: Routers;
	graphql: GraphQLApi;
	apollo: ApolloClient;
	location: LocationService;
	/** `browser`, `android` or `ios`, as `device.create` expects. */
	platform: DevicePlatform;
	/** Opens `tel:` links; resolves false when the device cannot call. */
	call(phone: string): Promise<boolean>;
	fetch: typeof fetch;
	/** Closes sockets; called when the app unmounts (tests, fast refresh). */
	dispose(): void;
}

export function devicePlatform(): DevicePlatform {
	return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'browser';
}

export async function callNumber(phone: string): Promise<boolean> {
	const url = `tel:${phone.replace(/\s+/g, '')}`;
	try {
		if (Platform.OS !== 'web' && !(await Linking.canOpenURL(url))) {
			return false;
		}
		await Linking.openURL(url);
		return true;
	} catch {
		return false;
	}
}

export function createServices(environment: Environment = defaultEnv, getToken: () => string | null = () => null): Services {
	const rpc = new RpcClient(environment.SERVICES_ENDPOINT);
	const apollo = createApolloClient({
		httpEndpoint: environment.GQL_ENDPOINT,
		subscriptionsEndpoint: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
		getToken,
	});

	return {
		env: environment,
		routers: createRouters(rpc),
		graphql: createGraphQLApi(apollo),
		apollo,
		location: createLocationService(environment),
		platform: devicePlatform(),
		call: callNumber,
		fetch: (input, init) => fetch(input, init),
		dispose: () => {
			rpc.close();
			apollo.stop();
		},
	};
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ services, children }: { services: Services; children: React.ReactNode }) {
	return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
	const services = useContext(ServicesContext);
	if (!services) {
		throw new Error('useServices() needs a <ServicesProvider>');
	}
	return services;
}
