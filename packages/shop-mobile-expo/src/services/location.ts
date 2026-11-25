/**
 * Current location, as the Ionic `GeoLocationService.getCurrentCoords`: the default coordinates when
 * both are set (then the device is never asked), else the device GPS, else the server's IP lookup.
 */
import * as ExpoLocation from 'expo-location';
import type { Environment } from '../config/env';
import type { Coordinates, Location } from '../domain/types';

export function toLocation(coords: Coordinates): Location {
	return { type: 'Point', coordinates: [coords.longitude, coords.latitude] };
}

export function fromLocation(location: Location | null | undefined): Coordinates | null {
	if (!location?.coordinates) {
		return null;
	}
	const [longitude, latitude] = location.coordinates;
	return { latitude, longitude };
}

export function withTimeout<T>(promise: Promise<T>, ms: number, message = 'Timed out'): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(message)), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

export interface LocationService {
	/** Coordinates or a rejection when none of the sources works. */
	getCurrentCoords(): Promise<Coordinates>;
	/** Device GPS only (no defaults, no IP lookup), null when unavailable. */
	getDeviceCoords(): Promise<Coordinates | null>;
	/** Forward geocode of a typed address (platform geocoder; null on the web or when unknown). */
	geocodeAddress(address: string): Promise<Coordinates | null>;
}

export function createLocationService(
	env: Pick<Environment, 'DEFAULT_LATITUDE' | 'DEFAULT_LONGITUDE' | 'SERVICES_ENDPOINT'>,
	fetchFn: typeof fetch = fetch,
): LocationService {
	async function getDeviceCoords(): Promise<Coordinates | null> {
		try {
			const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				return null;
			}
			// The Ionic app waited at most 30 s with high accuracy (GPS when enabled).
			const position = await withTimeout(
				ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High }),
				30000,
			);
			const { latitude, longitude } = position.coords;
			return latitude && longitude ? { latitude, longitude } : null;
		} catch {
			return null;
		}
	}

	async function getLocationByIP(): Promise<Coordinates | null> {
		try {
			const response = await withTimeout(
				fetchFn(`${env.SERVICES_ENDPOINT}/getLocationByIP`, {
					headers: { 'Content-Type': 'application/json' },
				}),
				10000,
			);
			if (!response.ok) {
				return null;
			}
			const body = (await response.json()) as Partial<Coordinates> | null;
			return body && body.latitude != null && body.longitude != null
				? { latitude: body.latitude, longitude: body.longitude }
				: null;
		} catch {
			return null;
		}
	}

	async function geocodeAddress(address: string): Promise<Coordinates | null> {
		try {
			const [first] = await withTimeout(ExpoLocation.geocodeAsync(address), 15000);
			return first ? { latitude: first.latitude, longitude: first.longitude } : null;
		} catch {
			return null;
		}
	}

	return {
		getDeviceCoords,
		geocodeAddress,
		async getCurrentCoords() {
			if (env.DEFAULT_LATITUDE && env.DEFAULT_LONGITUDE) {
				return { latitude: env.DEFAULT_LATITUDE, longitude: env.DEFAULT_LONGITUDE };
			}
			const coords = (await getDeviceCoords()) ?? (await getLocationByIP());
			if (!coords) {
				throw new Error("Can't detect location");
			}
			return coords;
		},
	};
}
