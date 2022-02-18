import * as Location from 'expo-location';

export interface FormattedAddressInterface {
	locality: string;
	thoroughfare: string;
	country: string;
}

/**
 * This helper function return a formatted address using **expo-location**
 *
 * @param coords An object with **Location.LocationObjectCoord** type
 * @returns FormattedAddressType
 */
export const getFormattedAddress: (
	coords: Location.LocationObjectCoords,
) => Promise<FormattedAddressInterface | null> = async (coords) => {
	if (coords) {
		const LocationGeocodedAddress = await Location.reverseGeocodeAsync({
			longitude: coords?.longitude,
			latitude: coords?.latitude,
		});

		console.log(LocationGeocodedAddress);
		if (LocationGeocodedAddress.length) {
			const firstLocationAddress = LocationGeocodedAddress[0];
			const formattedAddress: FormattedAddressInterface = {
				locality: firstLocationAddress.region as string,
				country: firstLocationAddress.country as string,
				thoroughfare: firstLocationAddress.street as string,
			};

			return formattedAddress;
		}
	}

	return null;
};
