// TYPES
import type { MaybeType, ScalarsInterface } from '../../types/index';
import type {
	GeoLocationInterface,
	GeoLocationCreateInputInterface,
	GeoLocationInputInterface,
	LocationInterface,
} from '../types';

// TODO: Add descriptive comments for types/interfaces

/**
 * Invite structure
 */
export interface InviteInterface {
	_id: ScalarsInterface['String'];
	id: ScalarsInterface['String'];
	code: ScalarsInterface['String'];
	apartment: ScalarsInterface['String'];
	geoLocation: GeoLocationInterface;
}

export interface InviteByCodeInputInterface {
	location: LocationInterface;
	inviteCode: ScalarsInterface['String'];
	firstName?: MaybeType<ScalarsInterface['String']>;
	lastName?: MaybeType<ScalarsInterface['String']>;
}

export interface InviteByLocationInputInterface {
	countryId: ScalarsInterface['Int'];
	city: ScalarsInterface['String'];
	streetAddress: ScalarsInterface['String'];
	house: ScalarsInterface['String'];
	apartment: ScalarsInterface['String'];
	postcode?: MaybeType<ScalarsInterface['String']>;
}

export interface QueryGetInviteByCodeArgsInterface {
	info: InviteByCodeInputInterface;
}

export interface QueryGetInviteByLocationArgsInterface {
	info?: MaybeType<InviteByLocationInputInterface>;
}

export interface CreateInviteByLocationMutationArgsInterface {
	createInput: InviteCreateInputInterface;
}

export interface InviteCreateInputInterface {
	code?: MaybeType<ScalarsInterface['String']>;
	apartment: ScalarsInterface['String'];
	geoLocation: GeoLocationCreateInputInterface;
}

export interface InviteInputInterface {
	code: ScalarsInterface['String'];
	apartment: ScalarsInterface['String'];
	geoLocation: GeoLocationInputInterface;
}
