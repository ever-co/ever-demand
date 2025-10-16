import type { MaybeType, ScalarsInterface } from '../../types';
import type { GeoLocationInputInterface } from '../types';

export interface MerchantsSearchedInterface {
	__typename: string;
	id: string;
	isActive: boolean;
	logo: string;
	name: string;
	username: string;
}

export interface QueryGetCloseMerchantsArgsInterface {
	geoLocation: GeoLocationInputInterface;
}

export interface MerchantsOrdersInterface {
	_id?: MaybeType<ScalarsInterface['String']>;
	ordersCount?: MaybeType<ScalarsInterface['Int']>;
}

export interface QueryGetMerchantsByNameArgsInterface {
	searchName: ScalarsInterface['String'];
	geoLocation?: MaybeType<GeoLocationInputInterface>;
}

export interface QueryGetStoreProductsArgs {
	storeId: ScalarsInterface['String'];
	fullProducts: ScalarsInterface['Boolean'];
}
