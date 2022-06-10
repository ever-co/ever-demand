// This file will contain common types & interfaces that arguments will use
import type { MaybeType, ScalarsInterface } from '../types/index';

export interface LocationInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

export interface GeolocationCoordinatesInterface {
	lng: ScalarsInterface['Float'];
	lat: ScalarsInterface['Float'];
}

export interface GeolocationInterface {
	_id?: MaybeType<ScalarsInterface['String']>;
	id?: MaybeType<ScalarsInterface['String']>;
	_createdAt?: MaybeType<ScalarsInterface['Date']>;
	createdAt?: MaybeType<ScalarsInterface['Date']>;
	_updatedAt?: MaybeType<ScalarsInterface['Date']>;
	updatedAt?: MaybeType<ScalarsInterface['Date']>;
	countryId: ScalarsInterface['Int'];
	countryName?: MaybeType<ScalarsInterface['String']>;
	city: ScalarsInterface['String'];
	streetAddress: ScalarsInterface['String'];
	house: ScalarsInterface['String'];
	postcode?: MaybeType<ScalarsInterface['String']>;
	notes?: MaybeType<ScalarsInterface['String']>;
	loc: LocationInterface;
	coordinates?: GeolocationCoordinatesInterface;
}

export interface GeolocationInputInterface {
	city?: ScalarsInterface['String'];
	countryId?: ScalarsInterface['Int'];
	house?: ScalarsInterface['String'];
	loc?: LocationInterface;
	notes?: MaybeType<ScalarsInterface['String']>;
	postcode?: MaybeType<ScalarsInterface['String']>;
	streetAddress?: ScalarsInterface['String'];
}

export interface PagingSortInputInterface {
	field: ScalarsInterface['String'];
	sortBy: ScalarsInterface['String'];
}

export interface PagingOptionsInputInterface {
	sort?: MaybeType<PagingSortInputInterface>;
	limit?: MaybeType<ScalarsInterface['Int']>;
	skip?: MaybeType<ScalarsInterface['Int']>;
}

export interface TranslateInterface {
	locale: ScalarsInterface['String'];
	value: ScalarsInterface['String'];
}

export interface ImageInterface {
	locale: ScalarsInterface['String'];
	url: ScalarsInterface['String'];
	width: ScalarsInterface['Int'];
	height: ScalarsInterface['Int'];
	orientation: ScalarsInterface['Int'];
}

export interface DeviceInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	channelId?: MaybeType<ScalarsInterface['String']>;
	type: ScalarsInterface['String'];
	uuid: ScalarsInterface['String'];
	language?: MaybeType<ScalarsInterface['String']>;
}

// ENTITIES
export interface UserInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	geoLocation: GeolocationInterface;
	apartment: ScalarsInterface['String'];
	firstName?: MaybeType<ScalarsInterface['String']>;
	lastName?: MaybeType<ScalarsInterface['String']>;
	email?: MaybeType<ScalarsInterface['String']>;
	phone?: MaybeType<ScalarsInterface['String']>;
	devicesIds: ScalarsInterface['String'][];
	devices: DeviceInterface[];
	image?: MaybeType<ScalarsInterface['String']>;
	fullAddress?: MaybeType<ScalarsInterface['String']>;
	createdAt?: MaybeType<ScalarsInterface['Date']>;
	isBanned: ScalarsInterface['Boolean'];
}

export interface UserLoginInfoInterface {
	user: UserInterface;
	token: ScalarsInterface['String'];
}

/**
 * Invite structure
 */
export interface InviteInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	code: ScalarsInterface['String'];
	apartment: ScalarsInterface['String'];
	geoLocation: GeolocationInterface;
}

export interface NewInviteInterface {
	__typename: string;
	apartment: string | number;
	code: string | number;
	geoLocation: {
		__typename: string;
		city: string;
		coordinates: {
			__typename: string;
			lat: number;
			lng: number;
		};
		countryId: number;
		countryName: string;
		createdAt: string;
		house: string;
		id: string;
		notes: string | null;
		postcode: string | null;
		streetAddress: string;
		updatedAt: string;
	};
	id: string;
}

export interface ProductInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	title: TranslateInterface[];
	description: TranslateInterface[];
	details: TranslateInterface[];
	images: ImageInterface[];
	categories?: MaybeType<MaybeType<ScalarsInterface['String']>[]>;
	detailsHTML: TranslateInterface[];
	descriptionHTML: TranslateInterface[];
	_createdAt?: MaybeType<ScalarsInterface['Date']>;
	_updatedAt?: MaybeType<ScalarsInterface['Date']>;
}

export interface WarehouseProductInterface {
	id: ScalarsInterface['String'];
	_id: ScalarsInterface['String'];
	price: ScalarsInterface['Int'];
	initialPrice: ScalarsInterface['Int'];
	count?: MaybeType<ScalarsInterface['Int']>;
	soldCount: ScalarsInterface['Int'];
	product: ProductInterface;
	isManufacturing?: MaybeType<ScalarsInterface['Boolean']>;
	isCarrierRequired?: MaybeType<ScalarsInterface['Boolean']>;
	isDeliveryRequired?: MaybeType<ScalarsInterface['Boolean']>;
	isTakeaway?: MaybeType<ScalarsInterface['Boolean']>;
	deliveryTimeMin?: MaybeType<ScalarsInterface['Int']>;
	deliveryTimeMax?: MaybeType<ScalarsInterface['Int']>;
}

export interface ProductInfoInterface {
	warehouseProduct: WarehouseProductInterface;
	distance: ScalarsInterface['Float'];
	warehouseId: ScalarsInterface['String'];
	warehouseLogo: ScalarsInterface['String'];
}
