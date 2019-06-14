import { Injectable } from '@angular/core';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { Geolocation } from '@ionic-native/geolocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { environment } from 'environment';

@Injectable()
export class GeoLocationService {
	constructor() {}

	getCurrentGeoLocation(): Promise<GeoLocation> {
		return new Promise(async (resolve, reject) => {
			try {
				const defaultLat = environment.DEFAULT_LATITUDE;
				const defaultLng = environment.DEFAULT_LONGITUDE;

				let coords: { longitude: number; latitude: number };

				if (!environment.production && defaultLat && defaultLng) {
					coords = { latitude: defaultLat, longitude: defaultLng };
				} else {
					const data = await Geolocation.getCurrentPosition();
					coords = data.coords;
				}

				const location: ILocation = {
					type: 'Point',
					coordinates: [coords.longitude, coords.latitude]
				};
				if (!location) {
					throw new Error(`Can't detect location`);
				}

				const currentGeolocation = new GeoLocation({
					_id: '',
					loc: location,
					countryId: null,
					city: null,
					streetAddress: null,
					house: null,
					_createdAt: '',
					_updatedAt: ''
				});

				resolve(currentGeolocation);
			} catch (error) {
				reject(error);
			}
		});
	}
}
