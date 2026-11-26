/**
 * Typed facades of the pyro routers the shop calls (feature inventory §1.3). Method names and
 * argument order match `packages/common-angular/src/routers/*` exactly.
 */
import type { Observable } from 'rxjs';
import type { DeliveryType, DevicePlatform, Language } from '../domain/enums';
import type {
	Device,
	GeoLocation,
	Invite,
	InviteRequest,
	Location,
	Order,
	ReverseGeocodedAddress,
	StripeCard,
	User,
	Warehouse,
	WarehouseProduct,
} from '../domain/types';
import type { RpcClient } from './client';

export interface DeviceCreateInput {
	channelId: string | null;
	language: string;
	type: DevicePlatform;
	uuid: string;
}

export interface EnterByCodeInput {
	location?: Location;
	inviteCode: string;
}

export interface EnterByLocationInput {
	apartment: string;
	house: string;
	streetAddress: string;
	city: string;
	countryId: number;
	notes?: string;
}

export interface InviteRequestCreateInput {
	geoLocation: Omit<GeoLocation, '_id' | 'postcode' | 'countryName'> & { notes?: string };
	apartment: string;
	deviceId: string | null;
}

export interface RegisterInput {
	user: { apartment: string; geoLocation: GeoLocation };
}

export interface OrderCreateProduct {
	count: number;
	productId: string;
}

export interface OrderCreateInput {
	warehouseId: string;
	products: OrderCreateProduct[];
	userId: string;
	orderType: DeliveryType;
	waitForCompletion?: boolean;
	options: { autoConfirm: boolean };
}

export interface OrderGetOptions {
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

export function createRouters(client: RpcClient) {
	const device = client.router('device');
	const invite = client.router('invite');
	const inviteRequest = client.router('invite-request');
	const userAuth = client.router('user-auth');
	const user = client.router('user');
	const userProducts = client.router('user-products');
	const geoLocation = client.router('geo-location');
	const warehouse = client.router('warehouse');
	const warehouseProducts = client.router('warehouse-products');
	const warehouseOrders = client.router('warehouse-orders');
	const order = client.router('order');

	return {
		device: {
			create: (input: DeviceCreateInput) => device.run<Device>('create', input),
			updateLanguage: (deviceId: string, language: Language) =>
				device.run<Device>('updateLanguage', deviceId, language),
		},
		invite: {
			getInvitesSettings: () => invite.run<{ isEnabled: boolean }>('getInvitesSettings'),
			getByCode: (input: EnterByCodeInput): Observable<Invite | null> =>
				invite.runAndObserve<Invite | null>('getByCode', input),
			getByLocation: (input: EnterByLocationInput): Observable<Invite | null> =>
				invite.runAndObserve<Invite | null>('getByLocation', input),
			create: (request: InviteRequest) => invite.run<Invite>('create', request),
		},
		inviteRequest: {
			create: (input: InviteRequestCreateInput) =>
				inviteRequest.run<InviteRequest>('create', input),
		},
		userAuth: {
			getRegistrationsSettings: () =>
				userAuth.run<{ registrationRequiredOnStart: boolean }>('getRegistrationsSettings'),
			register: (input: RegisterInput) => userAuth.run<User>('register', input),
		},
		user: {
			get: (userId: string): Observable<User | null> => user.runAndObserve<User | null>('get', userId),
			getCards: (userId: string) => user.run<StripeCard[]>('getCards', userId),
			updateEmail: (userId: string, email: string) => user.run<User>('updateEmail', userId, email),
			addPaymentMethod: (userId: string, tokenId: string) =>
				user.run<string>('addPaymentMethod', userId, tokenId),
			getAboutUs: (userId: string | null, deviceId: string | null, language: string) =>
				user.runAndObserve<string>('getAboutUs', userId, deviceId, language),
			getHelp: (userId: string | null, deviceId: string | null, language: string) =>
				user.runAndObserve<string>('getHelp', userId, deviceId, language),
			getPrivacy: (userId: string | null, deviceId: string | null, language: string) =>
				user.runAndObserve<string>('getPrivacy', userId, deviceId, language),
			getTermsOfUse: (userId: string | null, deviceId: string | null, language: string) =>
				user.runAndObserve<string>('getTermsOfUse', userId, deviceId, language),
		},
		userProducts: {
			getPlaceholder: (userId: string, deviceId: string | null) =>
				userProducts.runAndObserve<string>('getPlaceholder', userId, deviceId),
		},
		geoLocation: {
			getAddressByCoordinatesUsingArcGIS: (lat: number, lng: number) =>
				geoLocation.run<ReverseGeocodedAddress | null>('getAddressByCoordinatesUsingArcGIS', lat, lng),
		},
		warehouse: {
			get: (warehouseId: string, fullProducts = true): Observable<Warehouse> =>
				warehouse.runAndObserve<Warehouse>('get', warehouseId, fullProducts),
		},
		warehouseProducts: {
			get: (warehouseId: string, fullProducts = true): Observable<WarehouseProduct[]> =>
				warehouseProducts.runAndObserve<WarehouseProduct[]>('get', warehouseId, fullProducts),
		},
		warehouseOrders: {
			create: (input: OrderCreateInput) => warehouseOrders.run<Order>('create', input),
			addMore: (warehouseId: string, userId: string, orderId: string, products: OrderCreateProduct[]) =>
				warehouseOrders.run<Order>('addMore', warehouseId, userId, orderId, products),
			userComplete: (orderId: string) => warehouseOrders.run<Order>('userComplete', orderId),
			cancel: (orderId: string) => warehouseOrders.run<Order>('cancel', orderId),
		},
		order: {
			get: (orderId: string, options?: OrderGetOptions): Observable<Order> =>
				order.runAndObserve<Order>('get', orderId, options),
			confirm: (orderId: string) => order.run<Order>('confirm', orderId),
			/** 2 args for a saved card, 3 for a new card (the server checks the shown currency). */
			payWithStripe: (orderId: string, cardId: string, shownCurrency?: string) =>
				shownCurrency == null
					? order.run<Order>('payWithStripe', orderId, cardId)
					: order.run<Order>('payWithStripe', orderId, cardId, shownCurrency),
			getStripeCurrency: () => order.run<string>('getStripeCurrency'),
			refundWithStripe: (orderId: string) => order.run<Order>('refundWithStripe', orderId),
			removeProducts: (orderId: string, productIds: string[]) =>
				order.run<Order>('removeProducts', orderId, productIds),
			addProductComment: (orderId: string, orderProductId: string, comment: string) =>
				order.run<Order>('addProductComment', orderId, orderProductId, comment),
		},
	};
}

export type Routers = ReturnType<typeof createRouters>;
