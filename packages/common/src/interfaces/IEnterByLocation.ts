import { Country } from '../entities/GeoLocation';
import { IAddress } from './IGeoLocation';

interface IEnterByLocation {
	countryId: Country;
	city: string;
	streetAddress: string;
	house: string;
	postcode?: string | null;
	apartment: string;
}

export function toEnterByLocation(
	location: IAddress,
	apartment: string
): IEnterByLocation {
	return {
		apartment,
		house: location.house,
		streetAddress: location.streetAddress,
		city: location.city,
		countryId: location.countryId,
		postcode: location.postcode,
	} as any;
}

export default IEnterByLocation;
