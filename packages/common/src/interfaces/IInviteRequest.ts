import IGeoLocation, {
	IGeoLocationCreateObject,
	IGeolocationUpdateObject,
} from './IGeoLocation';

import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface IInviteRequestCreateObject extends DBCreateObject {
	apartment: string;
	geoLocation: IGeoLocationCreateObject;
	deviceId?: string;
	isManual?: boolean;
	isInvited?: boolean;
	invitedDate?: Date;
}

export interface IInviteRequestUpdateObject {
	apartment?: string;
	isManual?: boolean;
	geoLocation?: IGeolocationUpdateObject;
	isInvited?: boolean;
	invitedDate?: Date;
}

export interface IInviteRequestRawObject
	extends IInviteRequestCreateObject,
		DBRawObject {
	_id: PyroObjectId;
	geoLocation: IGeoLocation;
}
