//  This file will contain common types & interfaces that arguments will use
import type { MaybeType, ScalarsInterface } from '../types/index';

export interface GeoLocationInterface {
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
	loc: LocInterface;
	coordinates?: GeoLocationCoordinatesInterface;
}

export interface GeoLocationCoordinatesInterface {
	lng: ScalarsInterface['Float'];
	lat: ScalarsInterface['Float'];
}

export interface LocInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

export interface GeoLocationCreateInputInterface {
	countryId: ScalarsInterface['Int'];
	city: ScalarsInterface['String'];
	streetAddress: ScalarsInterface['String'];
	house: ScalarsInterface['String'];
	postcode?: MaybeType<ScalarsInterface['String']>;
	notes: MaybeType<ScalarsInterface['String']>;
	loc: LocInputInterface;
}

export interface LocInputInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

export interface GeoLocationInputInterface {
	countryId?: MaybeType<ScalarsInterface['Int']>;
	countryName?: MaybeType<ScalarsInterface['String']>;
	city?: MaybeType<ScalarsInterface['String']>;
	streetAddress?: MaybeType<ScalarsInterface['String']>;
	house?: MaybeType<ScalarsInterface['String']>;
	postcode?: MaybeType<ScalarsInterface['String']>;
	loc: LocationInterface;
}

export interface LocationInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

export interface PagingOptionsInputInterface {
	sort?: MaybeType<PagingSortInputInterface>;
	limit?: MaybeType<ScalarsInterface['Int']>;
	skip?: MaybeType<ScalarsInterface['Int']>;
}

export interface PagingSortInputInterface {
	field: ScalarsInterface['String'];
	sortBy: ScalarsInterface['String'];
}

export interface ImageInterface {
	locale: ScalarsInterface['String'];
	url: ScalarsInterface['String'];
	width: ScalarsInterface['Int'];
	height: ScalarsInterface['Int'];
	orientation: ScalarsInterface['Int'];
}

export interface TranslateInterface {
	locale: ScalarsInterface['String'];
	value: ScalarsInterface['String'];
}
