import { Injectable } from '@angular/core';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscribable } from 'rxjs';
import { environment } from 'environments/environment';

interface Coords {
	longitude?: number;
	latitude?: number;
}

@Injectable()
export class GeoLocationService {
	private headers: HttpHeaders = new HttpHeaders({
		'Content-Type': 'application/json',
	});

	constructor(private http: HttpClient) {}

	getCurrentGeoLocation(): Promise<GeoLocation> {
		return new Promise(async (resolve, reject) => {
			try {
				const coords = await this.getCurrentCoords();
				const location: ILocation = {
					type: 'Point',
					coordinates: [coords.longitude, coords.latitude],
				};

				const currentGeolocation = new GeoLocation({
					_id: '',
					loc: location,
					countryId: null,
					city: null,
					streetAddress: null,
					house: null,
					_createdAt: '',
					_updatedAt: '',
				});
				resolve(currentGeolocation);
			} catch (error) {
				reject(error);
			}
		});
	}

	getCurrentCoords(): Promise<Coords> {
		return new Promise((resolve, reject) => {
			const defaultLat = environment.DEFAULT_LATITUDE;
			const defaultLng = environment.DEFAULT_LONGITUDE;

			if (defaultLat && defaultLng) {
				resolve(
					this.getCoordsObj({
						latitude: defaultLat,
						longitude: defaultLng,
					})
				);

				return;
			}

			navigator.geolocation.getCurrentPosition(
				(res) => {
					// If user is enable GPS on browser
					resolve(this.getCoordsObj(res.coords));
				},
				(err) => {
					// If user is denied GPS on browser
					this.getLocationByIP().subscribe((res) => {
						if (res) {
							resolve(this.getCoordsObj(res));
						} else {
							reject(err.message);
						}
					});
				}
			);
		});
	}

	private getLocationByIP(): Subscribable<Coords | null> {
		return this.http.get(
			environment.SERVICES_ENDPOINT + '/getLocationByIP',
			{ headers: this.headers }
		);
	}

	private getCoordsObj(coords: Coords) {
		return {
			longitude: coords.longitude,
			latitude: coords.latitude,
		};
	}
}
