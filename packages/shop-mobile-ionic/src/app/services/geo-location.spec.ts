import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { GeoLocationService } from './geo-location';

// Lets every pending promise callback run.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('GeoLocationService', () => {
	let service: GeoLocationService;
	let http: HttpTestingController;
	const defaults = {
		lat: environment.DEFAULT_LATITUDE,
		lng: environment.DEFAULT_LONGITUDE,
	};
	const originalGeolocation = Object.getOwnPropertyDescriptor(
		navigator,
		'geolocation'
	);

	// The browser's geolocation, which the Capacitor plugin uses on the web.
	const stubBrowserLocation = (
		result:
			| { coords: { latitude: number; longitude: number } }
			| { error: string }
	) => {
		Object.defineProperty(navigator, 'geolocation', {
			configurable: true,
			value: {
				getCurrentPosition: (ok, fail) =>
					'error' in result
						? fail({ code: 1, message: result.error })
						: ok({ coords: result.coords, timestamp: 0 }),
				watchPosition: () => 0,
				clearWatch: () => undefined,
			},
		});
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				GeoLocationService,
				provideHttpClient(),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(GeoLocationService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		environment.DEFAULT_LATITUDE = defaults.lat;
		environment.DEFAULT_LONGITUDE = defaults.lng;
		if (originalGeolocation) {
			Object.defineProperty(navigator, 'geolocation', originalGeolocation);
		} else {
			delete (navigator as any).geolocation;
		}
		http.verify();
	});

	it('uses the configured default location without asking the device', async () => {
		environment.DEFAULT_LATITUDE = 42.6459136;
		environment.DEFAULT_LONGITUDE = 23.3332736;

		const location = await service.getCurrentGeoLocation();

		expect(location.loc).toEqual({
			type: 'Point',
			coordinates: [23.3332736, 42.6459136],
		});
	});

	describe('without a default location', () => {
		beforeEach(() => {
			environment.DEFAULT_LATITUDE = 0;
			environment.DEFAULT_LONGITUDE = 0;
		});

		it('asks the device (Capacitor Geolocation)', async () => {
			stubBrowserLocation({ coords: { latitude: 1.5, longitude: 2.5 } });

			expect(await service.getCurrentCoords()).toEqual({
				latitude: 1.5,
				longitude: 2.5,
			});
		});

		it('falls back to the location of the IP address when the customer refuses', async () => {
			stubBrowserLocation({ error: 'User denied Geolocation' });

			const coords = service.getCurrentCoords();
			await settle();
			const request = http.expectOne(
				`${environment.SERVICES_ENDPOINT}/getLocationByIP`
			);
			expect(request.request.method).toBe('GET');
			request.flush({ latitude: 3, longitude: 4 });

			expect(await coords).toEqual({ latitude: 3, longitude: 4 });
		});

		it('rejects when neither the device nor the IP address gives a location', async () => {
			stubBrowserLocation({ error: 'User denied Geolocation' });

			const coords = service.getCurrentCoords();
			await settle();
			http.expectOne(
				`${environment.SERVICES_ENDPOINT}/getLocationByIP`
			).flush(null);

			await expect(coords).rejects.toBe('User denied Geolocation');
		});
	});
});
