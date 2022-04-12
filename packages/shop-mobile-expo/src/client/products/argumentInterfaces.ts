import type {
	ImageInterface,
	TranslateInterface,
	PagingOptionsInputInterface,
	GeoLocationInputInterface,
} from '../types';
import type { MaybeType, ScalarsInterface } from '../../types';

// TODO: Add more comments
// TODO: Move other types outside of argumentInterfaces file

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

export interface ProductCreateInputInterface {
	title: TranslateInterface[];
	description: TranslateInterface[];
	details?: MaybeType<TranslateInterface[]>;
	images: ImageInterface[];
	categories?: MaybeType<ProductsCategoryInputInterface[]>;
	detailsHTML?: MaybeType<TranslateInterface[]>;
	descriptionHTML?: MaybeType<TranslateInterface[]>;
}

export interface ProductInfoInterface {
	warehouseProduct: WarehouseProductInterface;
	distance: ScalarsInterface['Float'];
	warehouseId: ScalarsInterface['String'];
	warehouseLogo: ScalarsInterface['String'];
}

export interface ProductSaveInputInterface {
	_id: ScalarsInterface['String'];
	id?: MaybeType<ScalarsInterface['String']>;
	title: TranslateInterface[];
	description: TranslateInterface[];
	details?: MaybeType<TranslateInterface[]>;
	images: ImageInterface[];
	categories?: MaybeType<ProductsCategoryInputInterface[]>;
	detailsHTML?: MaybeType<TranslateInterface[]>;
	descriptionHTML?: MaybeType<TranslateInterface[]>;
}

export interface ProductsCategoriesCreateInputInterface {
	name: TranslateInterface[];
	image?: MaybeType<ScalarsInterface['String']>;
}

export interface ProductsCategoriesFindInputInterface {
	noop?: MaybeType<ScalarsInterface['Void']>;
}

export interface ProductsCategoriesUpdatenputInterface {
	name?: MaybeType<TranslateInterface[]>;
}

export interface ProductsCategoryInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	name: TranslateInterface[];
	image?: MaybeType<ScalarsInterface['String']>;
	_createdAt?: MaybeType<ScalarsInterface['Date']>;
	_updatedAt?: MaybeType<ScalarsInterface['Date']>;
}

export interface ProductsCategoryInputInterface {
	_id: ScalarsInterface['String'];
	name?: MaybeType<TranslateInterface[]>;
}

export interface ProductsFindInputInterface {
	title?: MaybeType<TranslateInterface>;
	description?: MaybeType<TranslateInterface>;
	details?: MaybeType<TranslateInterface>;
	image?: MaybeType<ImageInterface>;
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

export interface GetGeoLocationProductsOptions {
	isDeliveryRequired?: MaybeType<ScalarsInterface['Boolean']>;
	isTakeaway?: MaybeType<ScalarsInterface['Boolean']>;
	merchantIds?: MaybeType<MaybeType<ScalarsInterface['String']>[]>;
	imageOrientation?: MaybeType<ScalarsInterface['Int']>;
	locale?: MaybeType<ScalarsInterface['String']>;
	wihoutCount?: MaybeType<ScalarsInterface['Boolean']>;
}

/**
 *
 */
export interface ProductsQueryArgsInterface {
	searchText?: MaybeType<ScalarsInterface['String']>;
	pagingOptions?: MaybeType<PagingOptionsInputInterface>;
	options?: MaybeType<GetGeoLocationProductsOptions>;
	geoLocation: GeoLocationInputInterface;
}
