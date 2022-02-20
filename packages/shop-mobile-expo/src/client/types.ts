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
	loc: LocInterface;
	coordinates: GeoLocationCoordinatesInterface;
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
	loc: LocInputInterface;
}

export interface LocInputInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

export interface GeoLocationInputInterface {
	countryId: ScalarsInterface['Int'];
	countryName?: MaybeType<ScalarsInterface['String']>;
	city: ScalarsInterface['String'];
	streetAddress: ScalarsInterface['String'];
	house: ScalarsInterface['String'];
	postcode?: MaybeType<ScalarsInterface['String']>;
	loc: Location;
}

export interface LocationInterface {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}
