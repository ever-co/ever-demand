import type {
	GeolocationInputInterface,
	PagingOptionsInputInterface,
} from '../types';
import type { MaybeType, ScalarsInterface } from '../../types';

// TODO: Add more comments
// TODO: Move global types outside of argument interfaces file

export interface GetGeolocationProductsOptions {
	isDeliveryRequired?: MaybeType<ScalarsInterface['Boolean']>;
	isTakeaway?: MaybeType<ScalarsInterface['Boolean']>;
	merchantIds?: MaybeType<MaybeType<ScalarsInterface['String']>[]>;
	imageOrientation?: MaybeType<ScalarsInterface['Int']>;
	locale?: MaybeType<ScalarsInterface['String']>;
	withoutCount?: MaybeType<ScalarsInterface['Boolean']>;
}

/**
 *
 */
export interface QueryGeolocationProductsByPagingArgsInterface {
	geoLocation: GeolocationInputInterface;
	pagingOptions?: MaybeType<PagingOptionsInputInterface>;
	options?: MaybeType<GetGeolocationProductsOptions>;
	searchText?: MaybeType<ScalarsInterface['String']>;
}

export interface QueryProductsArgsInterface {
	productId: ScalarsInterface['String'];
}

export interface QueryGetWarehouseProductArgsInterface {
	warehouseId: ScalarsInterface['String'];
	warehouseProductId: ScalarsInterface['String'];
}
