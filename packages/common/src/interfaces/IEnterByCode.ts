import { ILocation } from './IGeoLocation';

/**
 * Users (customers/carriers) could be invited by some code,
 * which valid for given user location
 *
 * @interface IEnterByCode
 */
interface IEnterByCode {
	location: ILocation;
	inviteCode: string;
	firstName?: string;
	lastName?: string;
}

export default IEnterByCode;
