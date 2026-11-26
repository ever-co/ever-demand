import type { AddressState } from '../components/GeoLoginForm/GeoLoginForm';
import type { Coordinates } from '../Context';

/** The user to register: the address of the form at the visitor's location. */
export function toUserInput(
	state: AddressState,
	coordinates: Coordinates | null,
) {
	return {
		email: state.email || undefined,
		firstName: state.firstName || undefined,
		lastName: state.lastName || undefined,
		phone: state.phone || undefined,
		apartment: state.apartment || '0',
		geoLocation: {
			loc: {
				type: 'Point',
				// GeoJSON order: longitude, latitude
				coordinates: coordinates ? [coordinates[1], coordinates[0]] : [],
			},
			city: state.city,
			countryId: Number(state.geoLocation.countryId),
			house: state.house,
			postcode: state.postcode || undefined,
			streetAddress: state.streetAddress,
		},
	};
}
