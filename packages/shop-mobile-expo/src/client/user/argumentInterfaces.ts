import type { MaybeType, ScalarsInterface } from '../../types/index';
import type { GeoLocationCreateInputInterface } from '../types';

// TODO: Add more comments

export interface UserCreateInputInterface {
	email?: MaybeType<ScalarsInterface['String']>;
	firstName?: MaybeType<ScalarsInterface['String']>;
	lastName?: MaybeType<ScalarsInterface['String']>;
	phone?: MaybeType<ScalarsInterface['String']>;
	image?: MaybeType<ScalarsInterface['String']>;
	geoLocation: GeoLocationCreateInputInterface;
	apartment: ScalarsInterface['String'];
}

export interface UserRegisterInputInterface {
	user: UserCreateInputInterface;
	password?: MaybeType<ScalarsInterface['String']>;
}
