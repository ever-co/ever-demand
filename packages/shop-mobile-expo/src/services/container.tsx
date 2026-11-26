/**
 * The app's service objects (the Angular DI singletons), created once and passed down by context
 * so screens and tests can swap any of them.
 */
import type { ApolloClient } from '@apollo/client';
import React, { createContext, useContext } from 'react';
import { Linking, Platform } from 'react-native';
import { env as defaultEnv, type Environment } from '../config/env';
import { resolveClientTenant, socketAuth } from '../config/tenant';
import type { DevicePlatform } from '../domain/enums';
import { createGraphQLApi, type GraphQLApi } from '../graphql/api';
import { createApolloClient } from '../graphql/client';
import { RpcClient, socketIoFactory } from '../rpc/client';
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

/** The shop's tenant (config/tenant.ts): build-time, else the web page's host, `?tenant=` or the kept one. */
export function shopTenant(environment: Environment = defaultEnv): string | null {
	return resolveClientTenant({ buildTenant: environment.TENANT, baseDomain: environment.TENANT_BASE_DOMAIN });
}

export function createServices(environment: Environment = defaultEnv, getToken: () => string | null = () => null): Services {
	const getTenant = () => shopTenant(environment);
	const rpc = new RpcClient(
		environment.SERVICES_ENDPOINT,
		socketIoFactory(() => socketAuth(getTenant(), getToken())),
	);
	const apollo = createApolloClient({
		httpEndpoint: environment.GQL_ENDPOINT,
		subscriptionsEndpoint: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
		getToken,
		getTenant,
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
