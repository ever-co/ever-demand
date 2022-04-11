// This file will contain some global types
// that will be used in the react app

// TODO: add more comments
export type MaybeType<T> = T | null;

export interface ScalarsInterface {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	Date: any;
	Any: any;
	Void: any;
}

export interface UserInterface {
	__typename: string;
	apartment: string | number;
	code: string | number;
	geoLocation: {
		__typename: string;
		city: string;
		coordinates: {
			__typename: string;
			lat: number;
			lng: number;
		};
		countryId: number;
		countryName: string;
		createdAt: string;
		house: 1;
		id: string;
		notes: string | null;
		postcode: string | null;
		streetAddress: string;
		updatedAt: string;
	};
	id: string;
}
