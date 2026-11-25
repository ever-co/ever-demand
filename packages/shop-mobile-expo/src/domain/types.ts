/**
 * Shapes of the objects the server sends (pyro RPC results and GraphQL rows). Fields are optional
 * where the GraphQL fragments or the RPC options leave them out.
 */
import type { DeliveryType, DevicePlatform, OrderBarcodeTypes } from './enums';

export interface LocaleMember {
	locale: string;
	value: string;
}

export interface ProductImage {
	locale: string;
	url: string;
	width?: number;
	height?: number;
	orientation?: number;
}

export interface Location {
	type: 'Point';
	/** `[longitude, latitude]` */
	coordinates: [number, number];
}

export interface GeoLocation {
	_id?: string;
	loc: Location;
	countryId: number | null;
	countryName?: string | null;
	city: string | null;
	postcode?: string | null;
	streetAddress: string | null;
	house: string | null;
	notes?: string | null;
	_createdAt?: string;
	_updatedAt?: string;
}

export interface Product {
	_id?: string;
	id: string;
	title: LocaleMember[];
	description: LocaleMember[];
	details?: LocaleMember[];
	images: ProductImage[];
}

export interface WarehouseProduct {
	_id?: string;
	id: string;
	price: number;
	initialPrice?: number;
	count?: number;
	soldCount?: number;
	/** The product object (full products) or its id. */
	product: Product | string;
	productId?: string;
	isManufacturing?: boolean;
	isCarrierRequired?: boolean;
	isDeliveryRequired?: boolean;
	isProductAvailable?: boolean;
	isTakeaway?: boolean;
	deliveryTimeMin?: number | null;
	deliveryTimeMax?: number | null;
}

/** A row of the product feed (`geoLocationProductsByPaging`). */
export interface ProductInfo {
	distance?: number;
	warehouseId: string;
	warehouseLogo?: string;
	warehouseProduct: WarehouseProduct & { product: Product };
	/** Set by the client when Buy failed or a poll saw `count === 0`. */
	soldOut?: boolean;
}

export interface Warehouse {
	_id?: string;
	id: string;
	name: string;
	username?: string;
	logo: string;
	isActive?: boolean;
	isPaymentEnabled?: boolean;
	contactPhone?: string | null;
	geoLocation?: GeoLocation;
	products?: WarehouseProduct[];
	orderBarcodeType?: OrderBarcodeTypes;
}

export interface User {
	_id?: string;
	id: string;
	email?: string | null;
	apartment?: string;
	geoLocation: GeoLocation;
}

export interface Carrier {
	_id?: string;
	id: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	geoLocation?: GeoLocation;
}

export interface OrderProduct {
	_id?: string;
	id?: string;
	count: number;
	price: number;
	initialPrice?: number;
	isTakeaway?: boolean;
	deliveryTimeMin?: number | null;
	deliveryTimeMax?: number | null;
	comment?: string | null;
	product: Product;
}

export interface Order {
	_id?: string;
	id: string;
	user?: User;
	warehouse?: Warehouse | string;
	warehouseId?: string;
	carrier?: Carrier | string | null;
	products: OrderProduct[];
	isConfirmed?: boolean;
	isCancelled?: boolean;
	isPaid?: boolean;
	/** GraphQL computes it; for RPC orders use `isOrderCompleted`. */
	isCompleted?: boolean;
	waitForCompletion?: boolean;
	warehouseStatus?: number;
	carrierStatus?: number;
	/** GraphQL computes it; for RPC orders use `orderStatus`. */
	status?: number;
	totalPrice?: number;
	orderNumber?: number;
	orderType?: DeliveryType;
	deliveryTime?: string | null;
	createdAt?: string;
	_createdAt?: string;
}

export interface Invite {
	_id?: string;
	id?: string;
	code?: string;
	apartment: string;
	geoLocation: GeoLocation;
	_createdAt?: string;
	_updatedAt?: string;
}

export interface InviteRequest {
	_id?: string;
	id: string;
	apartment: string;
	geoLocation: GeoLocation;
	deviceId?: string;
}

export interface Device {
	_id?: string;
	id: string;
	language?: string;
	type?: DevicePlatform;
	uuid?: string;
}

/** A Stripe card as `user.getCards` returns it (only the fields the app reads). */
export interface StripeCard {
	id: string;
	last4: string;
	brand?: string;
}

/** `geo-location.getAddressByCoordinatesUsingArcGIS` result. */
export interface ReverseGeocodedAddress {
	locality: string;
	thoroughfare: string;
	/** Country abbreviation, e.g. `BG`. */
	country: string;
}

export interface Merchant {
	id: string;
	username?: string;
	name: string;
	logo: string;
	isActive?: boolean;
}

export interface Coordinates {
	latitude: number;
	longitude: number;
}
