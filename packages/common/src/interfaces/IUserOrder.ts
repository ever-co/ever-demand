import IGeoLocation, { IGeoLocationCreateObject } from './IGeoLocation';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface IUserOrderInitializeObject extends DBCreateObject {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	socialIds?: string[];
	isRegistrationCompleted?: boolean;
	hash?: string;
}

export interface IUserOrderCreateObject extends IUserOrderInitializeObject {
	geoLocation: IGeoLocationCreateObject;
	devicesIds?: string[];
	apartment?: string;
	stripeCustomerId?: string;
}

interface IUserOrder
	extends IUserOrderCreateObject,
		IUserOrderInitializeObject,
		DBRawObject {
	_id: PyroObjectId;
	geoLocation: IGeoLocation;
	devicesIds: string[];
	readonly fullAddress: string;
}

export default IUserOrder;
