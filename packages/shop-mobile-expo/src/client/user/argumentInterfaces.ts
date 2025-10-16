import type { MaybeType, ScalarsInterface } from '../../types/index';
import type { GeolocationInputInterface } from '../types';

// TODO: Add more comments

export interface UserCreateInputInterface {
	email?: MaybeType<ScalarsInterface['String']>;
	firstName?: MaybeType<ScalarsInterface['String']>;
	lastName?: MaybeType<ScalarsInterface['String']>;
	phone?: MaybeType<ScalarsInterface['String']>;
	image?: MaybeType<ScalarsInterface['String']>;
	geoLocation: GeolocationInputInterface;
	apartment: ScalarsInterface['String'];
}

export interface UserRegisterArgsInterface {
	user: UserCreateInputInterface;
	password?: MaybeType<ScalarsInterface['String']>;
}

export interface UserLoginArgsInterface {
	email: ScalarsInterface['String'];
	password: ScalarsInterface['String'];
}
