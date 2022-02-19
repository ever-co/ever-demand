import * as Location from 'expo-location';

export interface FormattedLocationInterface {
	locality: string;
	thoroughfare: string;
	country: string;
	latitude: number;
	longitude: number;
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

		console.log(LocationGeoCoded);
		if (LocationGeoCoded.length) {
			const firstLocationGeoCoded = LocationGeoCoded[0];
			const formattedLocation: FormattedLocationInterface = {
				locality: firstLocationGeoCoded.region as string,
				country: firstLocationGeoCoded.country as string,
				thoroughfare: firstLocationGeoCoded.street as string,
				latitude: coords?.longitude,
				longitude: coords?.longitude,
			};

			return formattedLocation;
		}
	}

	return null;
};
