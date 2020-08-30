import IGeoLocation, {
	IGeoLocationCreateObject,
	IGeolocationUpdateObject,
} from './IGeoLocation';

import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface IInviteCreateObject extends DBCreateObject {
	code?: string;
	apartment: string;
	geoLocation: IGeoLocationCreateObject;
}

export interface IInviteUpdateObject {
	code?: string;
	apartment?: string;
	geoLocation?: IGeolocationUpdateObject;
}

interface IInvite extends IInviteCreateObject, DBRawObject {
	_id: PyroObjectId;
	code: string;
	geoLocation: IGeoLocation;
}

export default IInvite;
