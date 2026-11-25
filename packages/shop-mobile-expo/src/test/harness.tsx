/** Test doubles for the app services and a helper that renders the app at one route. */
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { render } from '@testing-library/react-native';
import { of } from 'rxjs';
import { AppRoot } from '../App';
import { env as baseEnv, type Environment } from '../config/env';
import type { GraphQLApi } from '../graphql/api';
import type { RouteName } from '../navigation/types';
import type { Routers } from '../rpc/routers';
import type { Services } from '../services/container';
import type { LocationService } from '../services/location';
import { createAppStore, type AppStore } from '../store';
import { initialSessionState, type SessionState } from '../store/session';
import { RegistrationSystem } from '../domain/enums';
import * as fx from './fixtures';

type DeepMockOverrides<T> = { [K in keyof T]?: Partial<T[K]> };

export function createMockRouters(overrides: DeepMockOverrides<Routers> = {}): Routers {
	const routers: Routers = {
		device: {
			create: jest.fn(async () => ({ id: 'device-1' })),
			updateLanguage: jest.fn(async () => ({ id: 'device-1' })),
		},
		invite: {
			getInvitesSettings: jest.fn(async () => ({ isEnabled: true })),
			getByCode: jest.fn(() => of(null)),
			getByLocation: jest.fn(() => of(null)),
			create: jest.fn(async () => fx.invite),
		},
		inviteRequest: {
			create: jest.fn(async () => ({ id: 'request-1', apartment: '3', geoLocation: fx.sofia })),
		},
		userAuth: {
			getRegistrationsSettings: jest.fn(async () => ({ registrationRequiredOnStart: true })),
			register: jest.fn(async () => fx.user),
		},
		user: {
			get: jest.fn(() => of(fx.user)),
			getCards: jest.fn(async () => []),
			updateEmail: jest.fn(async () => fx.user),
			addPaymentMethod: jest.fn(async () => 'card-1'),
			getAboutUs: jest.fn(() => of('<h1>About Ever</h1>')),
			getHelp: jest.fn(() => of('<h1>Help</h1>')),
			getPrivacy: jest.fn(() => of('<h1>Privacy</h1>')),
			getTermsOfUse: jest.fn(() => of('<h1>Terms</h1>')),
		},
		userProducts: { getPlaceholder: jest.fn(() => of('')) },
		geoLocation: { getAddressByCoordinatesUsingArcGIS: jest.fn(async () => null) },
		warehouse: { get: jest.fn(() => of(fx.warehouse)) },
		warehouseProducts: { get: jest.fn(() => of(fx.warehouse.products ?? [])) },
		warehouseOrders: {
			create: jest.fn(async () => fx.order()),
			addMore: jest.fn(async () => fx.order()),
			userComplete: jest.fn(async () => fx.order()),
			cancel: jest.fn(async () => fx.order({ isCancelled: true })),
		},
		order: {
			get: jest.fn(() => of(fx.order())),
			confirm: jest.fn(async () => fx.order({ isPaid: true })),
			payWithStripe: jest.fn(async () => fx.order({ isPaid: true })),
			getStripeCurrency: jest.fn(async () => 'usd'),
			refundWithStripe: jest.fn(async () => fx.order()),
			removeProducts: jest.fn(async () => fx.order()),
			addProductComment: jest.fn(async () => fx.order()),
		},
	} as unknown as Routers;

	for (const [name, methods] of Object.entries(overrides)) {
		Object.assign((routers as unknown as Record<string, object>)[name], methods);
	}
	return routers;
}

export function createMockGraphQL(overrides: Partial<GraphQLApi> = {}): GraphQLApi {
	return {
		watchGeoLocationProducts: jest.fn(() => of([fx.productInfo('1'), fx.productInfo('2')])),
		geoLocationProducts: jest.fn(async () => [fx.productInfo('1')]),
		countGeoLocationProducts: jest.fn(async () => 2),
		getWarehouseProduct: jest.fn(async () => fx.productInfo('1').warehouseProduct),
		getCloseMerchants: jest.fn(async () => [{ id: 'warehouse-1', name: 'Mega Pizza', logo: 'logo.png' }]),
		getMerchantsByName: jest.fn(async () => [
			{ id: 'warehouse-1', name: 'Mega Pizza', logo: 'logo.png', isActive: true },
		]),
		getOrderStatus: jest.fn(async () => 0),
		getOrderWaitForCompletion: jest.fn(async () => false),
		getOrderTotalPrice: jest.fn(async () => 10),
		generateOrdersByCustomerId: jest.fn(async () => undefined),
		...overrides,
	} as GraphQLApi;
}

export function createTestServices(
	options: {
		routers?: Routers;
		graphql?: GraphQLApi;
		env?: Partial<Environment>;
		mocks?: ReadonlyArray<MockLink.MockedResponse>;
		location?: Partial<LocationService>;
		call?: Services['call'];
		fetch?: typeof fetch;
	} = {},
): Services {
	return {
		env: { ...baseEnv, ...options.env },
		routers: options.routers ?? createMockRouters(),
		graphql: options.graphql ?? createMockGraphQL(),
		apollo: new ApolloClient({ link: new MockLink(options.mocks ?? []), cache: new InMemoryCache() }),
		location: {
			getCurrentCoords: jest.fn(async () => ({ latitude: 42.6459136, longitude: 23.3332736 })),
			getDeviceCoords: jest.fn(async () => null),
			...options.location,
		},
		platform: 'ios',
		call: options.call ?? jest.fn(async () => true),
		fetch: options.fetch ?? (jest.fn(async () => ({ ok: true, status: 200, type: 'basic', json: async () => ({}) })) as unknown as typeof fetch),
		dispose: jest.fn(),
	};
}

/** A first-run visitor: invite system on, registration required. */
export const visitorSession: Partial<SessionState> = {
	inviteSystem: true,
	registrationSystem: RegistrationSystem.Enabled,
	deviceId: 'device-1',
	language: 'en-US',
	serverConnection: 200,
};

/** A registered customer. */
export const customerSession: Partial<SessionState> = { ...visitorSession, userId: 'user-1' };

export async function renderApp({
	route,
	session = customerSession,
	services = createTestServices(),
	store,
}: {
	route: RouteName;
	session?: Partial<SessionState>;
	services?: Services;
	store?: AppStore;
}) {
	const appStore = store ?? createAppStore({ session: { ...initialSessionState, ...session } });
	const utils = await render(<AppRoot services={services} store={appStore} skipBootstrap initialRouteName={route} />);
	return { ...utils, store: appStore, services };
}
