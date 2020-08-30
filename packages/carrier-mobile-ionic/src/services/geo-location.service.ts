import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class GeoLocationService {
	defaultLocation() {
		const longitude = environment['DEFAULT_LONGITUDE'];
		const latitude = environment['DEFAULT_LATITUDE'];
		if (latitude && longitude) {
			return {
				coords: {
					longitude,
					latitude,
				},
			};
		}
		return;
	}
}
