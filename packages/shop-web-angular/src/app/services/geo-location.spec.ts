import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { GeoLocationService } from './geo-location';

describe('GeoLocationService', () => {
	let service: GeoLocationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				GeoLocationService,
				provideHttpClient(),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(GeoLocationService);
	});

	it('uses the default coordinates of the environment', async () => {
		const coords = await service.getCurrentCoords();

		expect(coords).toEqual({
			latitude: environment.DEFAULT_LATITUDE,
			longitude: environment.DEFAULT_LONGITUDE,
		});
	});

	it('builds a GeoJSON point (longitude first) for the products query', async () => {
		const geoLocation = await service.getCurrentGeoLocation();

		expect(geoLocation.loc).toEqual({
			type: 'Point',
			coordinates: [
				environment.DEFAULT_LONGITUDE,
				environment.DEFAULT_LATITUDE,
			],
		});
	});
});
