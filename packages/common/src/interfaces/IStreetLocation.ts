import { Country } from '../entities/GeoLocation';

interface IStreetLocation {
	country: Country;
	city: string;
	streetAddress: string;
}

export default IStreetLocation;
