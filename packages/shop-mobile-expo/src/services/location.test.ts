import * as ExpoLocation from 'expo-location';
import { createLocationService, fromLocation, toLocation } from './location';

const endpoint = 'http://localhost:5500';
const mocked = ExpoLocation as jest.Mocked<typeof ExpoLocation>;

describe('location service (Ionic GeoLocationService)', () => {
	it('uses the default coordinates and never asks the device when both are set', async () => {
		const service = createLocationService({ DEFAULT_LATITUDE: 42.6, DEFAULT_LONGITUDE: 23.3, SERVICES_ENDPOINT: endpoint });
		await expect(service.getCurrentCoords()).resolves.toEqual({ latitude: 42.6, longitude: 23.3 });
		expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
	});

	it('uses the device GPS when allowed', async () => {
		mocked.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' } as never);
		mocked.getCurrentPositionAsync.mockResolvedValueOnce({ coords: { latitude: 1, longitude: 2 } } as never);
		const service = createLocationService({ DEFAULT_LATITUDE: null, DEFAULT_LONGITUDE: null, SERVICES_ENDPOINT: endpoint });
		await expect(service.getCurrentCoords()).resolves.toEqual({ latitude: 1, longitude: 2 });
	});

	it('falls back to the server IP lookup, then fails', async () => {
		const fetchFn = jest.fn(async () => ({ ok: true, json: async () => ({ latitude: 3, longitude: 4 }) })) as unknown as typeof fetch;
		const service = createLocationService({ DEFAULT_LATITUDE: null, DEFAULT_LONGITUDE: null, SERVICES_ENDPOINT: endpoint }, fetchFn);
		await expect(service.getCurrentCoords()).resolves.toEqual({ latitude: 3, longitude: 4 });
		expect(fetchFn).toHaveBeenCalledWith(`${endpoint}/getLocationByIP`, expect.anything());

		const nothing = createLocationService(
			{ DEFAULT_LATITUDE: null, DEFAULT_LONGITUDE: null, SERVICES_ENDPOINT: endpoint },
			jest.fn(async () => ({ ok: true, json: async () => null })) as unknown as typeof fetch,
		);
		await expect(nothing.getCurrentCoords()).rejects.toThrow("Can't detect location");
	});

	it('geocodes a typed address with the platform geocoder', async () => {
		mocked.geocodeAsync.mockResolvedValueOnce([{ latitude: 5, longitude: 6 }] as never);
		const service = createLocationService({ DEFAULT_LATITUDE: null, DEFAULT_LONGITUDE: null, SERVICES_ENDPOINT: endpoint });
		await expect(service.geocodeAddress('Main 1, Sofia')).resolves.toEqual({ latitude: 5, longitude: 6 });
		await expect(service.geocodeAddress('nowhere')).resolves.toBeNull();
	});

	it('converts to and from GeoJSON points ([lng, lat])', () => {
		expect(toLocation({ latitude: 1, longitude: 2 })).toEqual({ type: 'Point', coordinates: [2, 1] });
		expect(fromLocation({ type: 'Point', coordinates: [2, 1] })).toEqual({ latitude: 1, longitude: 2 });
	});
});
