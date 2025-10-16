import * as Location from 'expo-location';

export interface FormattedLocationInterface {
	latitude: number;
	longitude: number;
	countryId: number;
	country: string;
	streetAddress: string;
	city: string;
}

/**
 * This helper function return a formatted address using **expo-location**
 *
 * @param coords An object with **Location.LocationObjectCoord** type
 * @returns FormattedLocationType
 */
export const getFormattedLocation: (
	coords: Location.LocationObjectCoords,
) => Promise<FormattedLocationInterface | null> = async (coords) => {
	if (coords) {
		const LocationGeoCoded = await Location.reverseGeocodeAsync({
			longitude: coords?.longitude,
			latitude: coords?.latitude,
		});

		if (LocationGeoCoded.length) {
			const firstLocationGeoCoded = LocationGeoCoded[0];
			const formattedLocation: FormattedLocationInterface = {
				longitude: coords.longitude,
				latitude: coords.latitude,
				city: firstLocationGeoCoded.city as string,
				country: firstLocationGeoCoded.country as string,
				countryId: 0,
				streetAddress: firstLocationGeoCoded.street as string,
			};

			return formattedLocation;
		}
	}

	return null;
};
