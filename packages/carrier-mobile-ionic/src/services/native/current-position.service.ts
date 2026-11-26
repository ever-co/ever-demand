import { inject, Injectable } from '@angular/core';
import { GEOLOCATION } from './plugins';

/** The subset of a geolocation fix the pages use (same shape as the old Ionic Native `Geoposition`). */
export interface CurrentPosition {
	coords: { latitude: number; longitude: number };
}

/**
 * Current device position through `@capacitor/geolocation`, which replaces
 * `@ionic-native/geolocation` + `cordova-plugin-geolocation`. On the web it uses
 * `navigator.geolocation`.
 */
@Injectable({ providedIn: 'root' })
export class CurrentPositionService {
	private readonly geolocation = inject(GEOLOCATION);

	async getCurrentPosition(): Promise<CurrentPosition> {
		const position = await this.geolocation.getCurrentPosition();
		return {
			coords: {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
		};
	}
}
