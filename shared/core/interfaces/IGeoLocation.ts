import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';
import { Country } from '../entities/GeoLocation';
import { Address } from 'cluster';

export interface ILocation {
	type: 'Point';
	coordinates: [number, number];
}

export interface IAddress {
	countryId: Country | null;
	city: string | null;
	postcode?: string | null;
	streetAddress: string | null;
	house: string | null;
	default: boolean;
}

export function getEmptyAddress(): IAddress {
	return {
		countryId: null,
		city: '',
		postcode: '',
		streetAddress: '',
		house: '',
		default: false
	};
}

export interface IGeoLocationCreateObject extends IAddress, DBCreateObject {
	loc: ILocation;
}

export interface IGeolocationUpdateObject {
	countryId?: Country | null;
	city?: string | null;
	postcode?: string | null;
	streetAddress?: string | null;
	house?: string | null;
	loc?: ILocation;
	default?: boolean;
}

interface IGeoLocation extends DBRawObject, IGeoLocationCreateObject {
	_id: PyroObjectId;
	_createdAt: Date | string;
	_updatedAt: Date | string;
}

export default IGeoLocation;
