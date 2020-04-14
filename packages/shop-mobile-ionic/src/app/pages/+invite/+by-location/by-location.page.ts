// imports from lodash have to be combined
import _ from 'lodash';
import { every, isEmpty, isNumber } from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import {
	Country,
	getCountryName,
} from '@modules/server.common/entities/GeoLocation';
import { first } from 'rxjs/operators';
import { InviteRouter } from '@modules/client.common.angular2/routers/invite-router.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Router } from '@angular/router';
import Invite from '@modules/server.common/entities/Invite';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from '../../../services/store.service';
import { UserAuthRouter } from '@modules/client.common.angular2/routers/user-auth-router.service';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import { Subject } from 'rxjs';
import { environment } from 'environments/environment';

@Component({
	selector: 'e-cu-by-location',
	templateUrl: './by-location.page.html',
	styleUrls: ['./by-location.page.scss'],
})
export class ByLocationPage implements OnInit, OnDestroy {
	public apartment: number;
	public isApartment: boolean = true;
	public house: number;
	public streetAddress: string;
	public city: string;
	public country: number = Country.IL;
	public detectingLocation: boolean = true;

	private readonly ngDestroy$ = new Subject<void>();

	constructor(
		private readonly store: Store,
		private readonly http: HttpClient,
		private readonly router: Router,
		private readonly userAuthRouter: UserAuthRouter,
		private readonly inviteRouter: InviteRouter,
		private readonly inviteRequestRouter: InviteRequestRouter,
		private readonly geoLocationRouter: GeoLocationRouter
	) {}

	ngOnInit() {
		setTimeout(async () => {
			await this.updateCurrentAddressByCoordinates();
		}, 50);
	}

	public get isValid() {
		const notEmptyString = (s: string) =>
			typeof s === 'string' && !isEmpty(s);

		return (
			every([this.city, this.streetAddress], notEmptyString) &&
			every([this.house, this.country], (n) => isNumber(n) && n !== 0) &&
			((isNumber(this.apartment) && this.apartment !== 0) ||
				!this.isApartment)
		);
	}

	protected async getCoordinates(): Promise<{
		lng: number;
		lat: number;
	} | null> {
		try {
			const options: GeolocationOptions = {
				timeout: 30000, // we don't want user to wait more than 30 sec in any case
				enableHighAccuracy: true, // will try to use GPS (if enabled) on mobile
			};

			const defaultLat = environment.DEFAULT_LATITUDE;
			const defaultLng = environment.DEFAULT_LONGITUDE;

			let response: { coords: { longitude: number; latitude: number } };

			if (defaultLat && defaultLng) {
				response = {
					coords: { latitude: defaultLat, longitude: defaultLng },
				};
			} else {
				response = await Geolocation.getCurrentPosition(options);
			}

			const { coords } = response;

			if (
				!response ||
				!response.coords ||
				!response.coords.latitude ||
				!response.coords.longitude
			) {
				console.log(
					'Device location using @ionic-native/geolocation services recieved empty'
				);
				return null;
			}

			console.log(
				`Device location using @ionic-native/geolocation services recieved: ${coords.latitude}, ${coords.longitude}`
			);

			return { lng: coords.longitude, lat: coords.latitude };
		} catch (error) {
			// nothing happens even if we can't detect location. User will just enter it manually
			console.warn("Can't detect location");
			console.warn(error);
			return null;
		}

		// let platform = this.deviceService.getPlatform();

		// try {
		// 	let results = await this._geoCode({ address: this._getAddressString() });

		// 	if (results.length > 0) {
		// 		const result = results[ 0 ];
		// 		return [ result.position.lat, result.position.lng ];
		// 	}

		// }
		// catch (err) {
		// 	console.log(err);
		// }

		// if (platform != 'browser') {
		// 	console.log('Couldn\'t get the coordinates!');
		// 	return null;
		// }
		// else {
		// 	return [ 31.789927, 34.646426 ];
		// }
	}

	async login(): Promise<void> {
		if (!this.isValid) {
			// this.$translate('INVITE_VIEW.INFO_MISSING')
			// 	.then(text => alert(text));

			alert(`Some of the information missing!`);

			throw new Error('Some of the info is missing!');
		}

		// this.$ionicLoading.show();

		try {
			const invite = await this.inviteRouter
				.getByLocation({
					apartment: this.isApartment
						? this.apartment.toString()
						: '0', // "" means single apartment house!
					house: this.house.toString(),
					streetAddress: this.streetAddress,
					city: this.city,
					countryId: this.country,
				})
				.pipe(first())
				.toPromise();

			if (invite != null) {
				// this.$ionicLoading.hide();
				// this.$state.go(
				//   'invite.byLocation.registerUser',
				//   <StateParams.Invite.ByLocation.RegisterUser>{ invite }
				// );
				await this.register(invite);
			} else {
				console.log('Creating invite request...');
				const inviteRequest = await this.createInviteRequest();
				if (this.store.inviteSystem) {
					const currentInvite = await this.processInviteRequest(
						inviteRequest
					);
				} else {
					const inviteCurrent = await this.inviteRouter.create(
						inviteRequest
					);
					await this.register(inviteCurrent);
				}
			}
		} catch (err) {
			// this.$ionicLoading.hide();
			console.error(err);
		}
	}

	async register(invite: Invite) {
		const user = await this.userAuthRouter.register({
			user: {
				apartment: invite.apartment,
				geoLocation: invite.geoLocation,
			},
		});

		localStorage.setItem('_userId', user.id);
		if (this.store.backToDetails) {
			this.goToDetailsPage();
			this.store.backToDetails = null;
			return;
		}
		this.router.navigate(['/products'], { skipLocationChange: true });
	}

	async goToDetailsPage() {
		const id = this.store.backToDetails;
		await this.router.navigate([`/products/product-details/${id}`], {
			skipLocationChange: true,
			queryParams: {
				backUrl: '/products',
				warehouseId: this.store.warehouseId,
			},
		});
	}

	private static israelAPIUrl: string =
		'https://data.gov.il/api/action/datastore_search';

	// TODO: use for Israeli customers
	private async _getIsraeliCities(query: string): Promise<string[]> {
		try {
			const params = new HttpParams()
				.set('plain', 'false')
				.set('resource_id', 'd4901968-dad3-4845-a9b0-a57d027f11ab')
				.set('limit', '100')
				.set('offset', '0')
				.set('fields', 'שם_ישוב')
				.set('distinct', 'true')
				.set('sort', 'שם_ישוב')
				.set(
					'q',
					JSON.stringify({ שם_ישוב: query.replace(' ', '+') + ':*' })
				);

			const successResponse: any = await this.http.get(
				ByLocationPage.israelAPIUrl,
				{ params }
			);

			const hebrewNames: string[] = successResponse.data.result.records.map(
				(it) => it['שם_ישוב']
			);
			// const englishNames: string[] = successResponse.data.result.records.map(it => it["שם_ישוב_לועזי"]);

			// return _.union(hebrewNames, englishNames)
			return _.map(hebrewNames, (name) =>
				name.trim().replace('(', ')').replace(')', '(')
			);
		} catch (err) {
			console.error(err);
			return [];
		}
	}

	private async processInviteRequest(
		inviteRequest: InviteRequest
	): Promise<void> {
		// this.$ionicLoading.hide();

		if (inviteRequest) {
			this.store.inviteRequestId = inviteRequest.id;
		} else {
			// TODO: show here that we can't get location and can't send invite because of that...
		}
		this.store.inviteAddress = inviteRequest.toAddressString();
		await this.router.navigateByUrl('invite/by-code');
	}

	private async createInviteRequest(): Promise<InviteRequest> {
		const device = { id: this.store.deviceId }; // await this.deviceService.device.pipe(first()).toPromise();

		let coordinatesObj = await this.getCoordinatesByAddress();

		if (coordinatesObj == null) {
			coordinatesObj = await this.getCoordinates();
		}

		if (coordinatesObj != null) {
			return this.inviteRequestRouter.create({
				geoLocation: {
					loc: {
						type: 'Point',
						coordinates: [coordinatesObj.lng, coordinatesObj.lat],
					},
					countryId: this.country,
					city: this.city,
					streetAddress: this.streetAddress,
					house: this.house.toString(),
				},
				apartment: this.isApartment ? this.apartment.toString() : '0',
				deviceId: device.id,
			});
		} else {
			throw new Error(
				"Can't get coordinates for the creation of invite request!"
			);
		}
	}

	private async updateCurrentAddressByCoordinates(): Promise<boolean> {
		try {
			console.log(
				'Attempt to detect device location using @ionic-native/geolocation services'
			);

			const coordinatesObj = await this.getCoordinates();

			if (!coordinatesObj) {
				this.detectingLocation = false;
				return false;
			}

			console.log(
				`Reverse geo-code address by coordinates [${coordinatesObj.lat}, ${coordinatesObj.lng}] started...`
			);

			let address = await this.geoLocationRouter.getAddressByCoordinatesUsingArcGIS(
				coordinatesObj.lat,
				coordinatesObj.lng
			);

			console.log(
				`Attempt to reverse geo-code address by coordinates finished. Result: ${address}`
			);

			if (!address) {
				try {
					address = await this.getAddressByGoogleGeocoder(
						coordinatesObj.lat,
						coordinatesObj.lng
					);
				} catch (error) {
					this.detectingLocation = false;
					return false;
				}
			}

			let result = false;

			if (!this.city) {
				this.city = address.locality;
				result = true;
			}

			if (!this.streetAddress) {
				this.streetAddress = address.thoroughfare;
				result = true;
			}

			this.country = +Country[address.country];

			this.detectingLocation = false;

			return result;
		} catch (err) {
			// nothing happens even if we can't detect location - the user will just enter it manually
			console.warn("Can't detect location");
			console.warn(err);
			this.detectingLocation = false;
		}

		return false;
	}

	ngOnDestroy(): void {
		console.warn('ByLocationPage did leave');

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}

	private getAddressByGoogleGeocoder(lat, lng) {
		const geocoder = new google.maps.Geocoder();

		return new Promise(function (resolve, reject) {
			geocoder.geocode(
				{
					location: { lng, lat },
				},
				(results, status) => {
					if (status === google.maps.GeocoderStatus.OK) {
						let country = results.find((x) =>
							x.types.includes('country')
						);

						let address = results.find((x) =>
							x.types.includes('street_address')
						);

						if (!address) {
							address = results.find((x) =>
								x.types.includes('route')
							);
						}

						const formattedAddress = {
							locality: address.address_components[3].short_name,
							thoroughfare:
								address.address_components[1].short_name,
							country: country.address_components[0].short_name,
						};

						resolve(formattedAddress);
					} else {
						reject('Cannot find the address.');
					}
				}
			);
		});
	}

	private getCoordinatesByAddress(): Promise<{
		lng: number;
		lat: number;
	} | null> {
		const house = this.house;
		const streetAddress = this.streetAddress;
		const city = this.city;
		const countryName = getCountryName(this.country);

		if (!streetAddress || !house || !city || !countryName) {
			return;
		}

		const geocoder = new google.maps.Geocoder();

		return new Promise(function (resolve, reject) {
			geocoder.geocode(
				{
					address: `${streetAddress} ${house}, ${city}`,
					componentRestrictions: {
						country: countryName,
					},
				},
				(results, status) => {
					if (status === google.maps.GeocoderStatus.OK) {
						const place: google.maps.GeocoderResult = results[0];

						const neededAddressTypes = [
							'country',
							'locality',
							'route',
							'street_number',
						];
						const existedTypes = place.address_components
							.map((ac) => ac.types)
							.reduce((acc, val) => acc.concat(val), []);

						for (const type of neededAddressTypes) {
							if (!existedTypes.includes(type)) {
								resolve(null);

								return;
							}
						}

						const loc = place.geometry.location;
						resolve({ lat: loc.lat(), lng: loc.lng() });
					} else {
						resolve(null);
					}
				}
			);
		});
	}
}
