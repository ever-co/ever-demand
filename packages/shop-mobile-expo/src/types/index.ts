// This file will contain some global types
// that will be used in the react app

// TODO: add more comments
export type MaybeType<T> = T | null;

export interface ScalarsInterface {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	Date: any;
	Any: any;
	Void: any;
}

export interface Device {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	channelId?: MaybeType<ScalarsInterface['String']>;
	type: ScalarsInterface['String'];
	uuid: ScalarsInterface['String'];
	language?: MaybeType<ScalarsInterface['String']>;
}

export interface GeoLocationCoordinates {
	lng: ScalarsInterface['Float'];
	lat: ScalarsInterface['Float'];
}

export interface Loc {
	type: ScalarsInterface['String'];
	coordinates: ScalarsInterface['Float'][];
}

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
	loc: Loc;
	coordinates: GeoLocationCoordinates;
}

export interface UserInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	geoLocation: GeoLocationInterface;
	apartment: ScalarsInterface['String'];
	firstName?: MaybeType<ScalarsInterface['String']>;
	lastName?: MaybeType<ScalarsInterface['String']>;
	email?: MaybeType<ScalarsInterface['String']>;
	phone?: MaybeType<ScalarsInterface['String']>;
	devicesIds: ScalarsInterface['String'][];
	devices: Device[];
	image?: MaybeType<ScalarsInterface['String']>;
	fullAddress?: MaybeType<ScalarsInterface['String']>;
	createdAt?: MaybeType<ScalarsInterface['Date']>;
	isBanned: ScalarsInterface['Boolean'];
}

export interface UserLoginInfoInterface {
	user: UserInterface;
	token: ScalarsInterface['String'];
}
