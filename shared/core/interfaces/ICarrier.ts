import IGeoLocation, { IGeoLocationCreateObject } from './IGeoLocation';
import CarrierStatus from '../enums/CarrierStatus';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface ICarrierCreateObject extends DBCreateObject {
	firstName: string;
	lastName: string;
	email?: string;
	numberOfDeliveries?: number;
	geoLocation: IGeoLocationCreateObject;
	apartment?: string;

	/**
	 * True carrier enabled in system,
	 * False carrier completely disabled in the system (e.g. was fired / banned)
	 * This setting is set by Admin, not by carrier itself
	 * (he/she set 'status' field instead in the carrier mobile app)
	 *
	 * @type {boolean}
	 * @memberof ICarrierCreateObject
	 */
	isDeleted?: boolean;

	// Current carrier status (set via his mobile app), e.g. Online or Offline
	status?: CarrierStatus;

	username: string;
	phone: string;

	skippedOrderIds?: string[];
	deliveriesCountToday?: number;
	totalDistanceToday?: number;

	devicesIds?: string[];
	isSharedCarrier: boolean;

	/**
	 * Url to Carrier logo/photo
	 *
	 * @type {string}
	 * @memberof ICarrierCreateObject
	 */
	logo: string;

	/**
	 * Password Hash
	 *
	 * @type {string}
	 * @memberof ICarrierCreateObject
	 */
	hash?: string;
}

interface ICarrier extends DBRawObject, ICarrierCreateObject {
	_id: PyroObjectId;
	numberOfDeliveries: number;
	isDeleted: boolean;
	geoLocation: IGeoLocation;
	skippedOrderIds: string[];
	status: CarrierStatus;
	deliveriesCountToday: number;
	totalDistanceToday: number;
	devicesIds: string[];
	logo: string;
	isSharedCarrier: boolean;
}

export default ICarrier;
