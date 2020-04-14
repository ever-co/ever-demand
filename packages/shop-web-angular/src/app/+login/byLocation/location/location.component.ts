import {
	Component,
	OnInit,
	Input,
	OnChanges,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild,
	AfterViewInit,
	OnDestroy,
} from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IUserCreateObject } from '@modules/server.common/interfaces/IUser';
import User from '@modules/server.common/entities/User';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import {
	Country,
	getCountryName,
	CountryName,
} from '@modules/server.common/entities/GeoLocation';
import { GeoLocationRouter } from '@modules/client.common.angular2/routers/geo-location-router.service';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { InviteRequestRouter } from '@modules/client.common.angular2/routers/invite-request-router.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isEmpty } from 'lodash';

import { countries } from '@modules/server.common/data/abbreviation-to-country';
import { environment } from 'environments/environment';

const defaultLng = environment.DEFAULT_LONGITUDE || 0;
const defaultLat = environment.DEFAULT_LATITUDE || 0;

@Component({
	selector: 'es-location-form',
	styleUrls: ['./location.component.scss'],
	templateUrl: '/location.component.html',
})
export class LocationFormComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	public static COUNTRIES: Array<{
		id: Country;
		name: CountryName;
	}> = Object.keys(countries).map((abbr) => {
		return { id: Country[abbr], name: getCountryName(+Country[abbr]) };
	});

	@Input()
	public InitUser: User;
	@Input()
	public coordinates: ILocation;
	@Input()
	place: google.maps.places.PlaceResult;

	@ViewChild('autocomplete')
	public searchElement: ElementRef;

	@Output()
	public mapCoordinatesEmitter = new EventEmitter<
		google.maps.LatLng | google.maps.LatLngLiteral
	>();

	@Output()
	public continue = new EventEmitter<boolean>();

	@Output()
	public mapGeometryEmitter = new EventEmitter<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>();

	public formControl = this.fb.group({
		house: ['', Validators.required],
		apartament: [''],
		countryId: ['', Validators.required],
		city: ['', Validators.required],
		streetAddress: ['', Validators.required],
		isApartment: ['checked'],
	});

	public streetAddress = this.formControl.get('streetAddress');
	public city = this.formControl.get('city');
	public readonly house = this.formControl.get('house');
	public readonly apartament = this.formControl.get('apartament');
	public readonly countryId = this.formControl.get('countryId');
	public readonly isApartment = this.formControl.get('isApartment');

	public statusForm: boolean;
	public showAutocompleteSearch: boolean = true;
	private _ngDestroy$ = new Subject<void>();
	private lat: number;
	private lng: number;
	private lastUsedAddressText: string;

	constructor(
		private readonly fb: FormBuilder,
		private geoLocationRouter: GeoLocationRouter,
		private inviteRequestRouter: InviteRequestRouter
	) {}

	get countries() {
		return LocationFormComponent.COUNTRIES;
	}

	get isApartmentValid() {
		const valid =
			(this.isApartment && !this.isApartment.value) ||
			this.apartament.value;
		return valid;
	}

	ngOnInit(): void {
		this.onChanges();
	}

	ngAfterViewInit(): void {
		this.initGoogleAutocompleteApi();
	}

	ngOnChanges(): void {
		if (this.place) {
			this.applyNewPlaceOnTheMap(this.place);
		} else if (this.coordinates) {
			this.onCoordinatesChanged();
		}
	}

	getCreateUserInfo(): IUserCreateObject {
		return {
			geoLocation: {
				loc: this.coordinates
					? this.getLocObj(
							Array.from(this.coordinates.coordinates).reverse()
					  )
					: this.getLocObj([defaultLng, defaultLat]),
				countryId: Country.IL,
				city: this.city.value,
				streetAddress: this.streetAddress.value,
				house: this.house.value.toString(),
			},
		};
	}

	onAddressChanges() {
		if (this.showAutocompleteSearch) {
			this.tryFindNewAddress();
		}
	}

	onCoordinatesChanged() {
		if (this.showAutocompleteSearch) {
			this.tryFindNewCoordinates();
		}
	}

	async createInviteRequest(): Promise<InviteRequest> {
		return this.inviteRequestRouter.create({
			geoLocation: {
				loc: this.coordinates
					? this.getLocObj(
							Array.from(this.coordinates.coordinates).reverse()
					  )
					: this.getLocObj([defaultLng, defaultLat]),
				countryId: Country.IL,
				city: this.city.value,
				streetAddress: this.streetAddress.value,
				house: this.house.value.toString(),
			},
			apartment: this.apartament.value
				? this.apartament.value.toString()
				: '0',
			deviceId: '1',
		});
	}

	private getLocObj(coordinates): ILocation {
		return {
			type: 'Point',
			coordinates,
		};
	}

	private onChanges() {
		this.formControl.statusChanges
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((value) => {
				this.statusForm =
					this.formControl.valid === true && this.isApartmentValid;
			});
	}

	private emitCoordinates(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.mapCoordinatesEmitter.emit(location);
	}

	private emitGeometry(
		geometry:
			| google.maps.places.PlaceGeometry
			| google.maps.GeocoderGeometry
	) {
		this.mapGeometryEmitter.emit(geometry);
	}

	private applyNewPlaceOnTheMap(
		place: google.maps.places.PlaceResult | google.maps.GeocoderResult,
		useGeometryLatLng: boolean = true
	) {
		if (place.geometry === undefined || place.geometry === null) {
			// this._popInvalidAddressMessage();
			return;
		}

		if (useGeometryLatLng) {
			const loc = place.geometry.location;
			this.coordinates.coordinates = [loc.lat(), loc.lng()];
		}

		// If the place has a geometry, then present it on a map.
		this.emitGeometry(place.geometry);

		this.emitCoordinates(
			new google.maps.LatLng(
				this.coordinates.coordinates[0],
				this.coordinates.coordinates[1]
			)
		);

		this.gatherAddressInformation(place);
	}

	private tryFindNewAddress() {
		const house = this.house.value;
		const streetAddress = this.streetAddress.value;
		const city = this.city.value;
		const countryName = getCountryName(+this.countryId.value);
		if (
			isEmpty(streetAddress) ||
			isEmpty(house) ||
			isEmpty(city) ||
			isEmpty(countryName)
		) {
			return;
		}

		const newAddress = `${house}${streetAddress}${city}${countryName}`;
		if (newAddress !== this.lastUsedAddressText) {
			this.lastUsedAddressText = newAddress;

			const geocoder = new google.maps.Geocoder();

			geocoder.geocode(
				{
					address: `${streetAddress} ${house}, ${city}`,
					componentRestrictions: {
						country: countryName,
					},
				},
				(results, status) => {
					if (status === google.maps.GeocoderStatus.OK) {
						const formattedAddress = results[0].formatted_address;
						const place: google.maps.GeocoderResult = results[0];

						const neededAddressTypes = [
							'country',
							'locality',
							'route',
							'street_number',
						];
						let existedTypes = place.address_components
							.map((ac) => ac.types)
							.reduce((acc, val) => acc.concat(val), []);

						for (const type of neededAddressTypes) {
							if (!existedTypes.includes(type)) {
								this.statusForm = false;
							}
						}

						this.applyNewPlaceOnTheMap(place);
						this.applyFormattedAddress(formattedAddress);
					}
				}
			);
		}
	}

	private tryFindNewCoordinates() {
		const formCoordinates = this.coordinates.coordinates;
		this.lat = formCoordinates[0];
		this.lng = formCoordinates[1];

		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{
				location: { lng: this.lng, lat: this.lat },
			},
			(results, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					const formattedAddress = results[0].formatted_address;
					const place = results[0];

					const useGeometryLatLng = false;
					this.applyNewPlaceOnTheMap(place, useGeometryLatLng);
					this.applyFormattedAddress(formattedAddress);
				}
			}
		);
	}

	private applyFormattedAddress(address: string) {
		if (this.searchElement) {
			this.searchElement.nativeElement.value = address;
		}
	}

	private gatherAddressInformation(
		locationResult:
			| google.maps.GeocoderResult
			| google.maps.places.PlaceResult
	) {
		const longName = 'long_name';
		const shortName = 'short_name';

		const neededAddressTypes = {
			country: shortName,
			locality: longName,
			// 'neighborhood' is not need for now
			// neighborhood: longName,
			route: longName,
			intersection: longName,
			street_number: longName,
			postal_code: longName,
			administrative_area_level_1: shortName,
			administrative_area_level_2: shortName,
			administrative_area_level_3: shortName,
			administrative_area_level_4: shortName,
			administrative_area_level_5: shortName,
		};

		let streetName = '';
		let streetNumber = ''; // is house number also
		let countryId = '';
		let postcode = '';
		let city = '';

		locationResult.address_components.forEach((address) => {
			const addressType = address.types[0];
			const addressTypeKey = neededAddressTypes[addressType];

			const val = address[addressTypeKey];

			switch (addressType) {
				case 'country':
					countryId = val;
					break;
				case 'locality':
				case 'administrative_area_level_1':
				case 'administrative_area_level_2':
				case 'administrative_area_level_3':
				case 'administrative_area_level_4':
				case 'administrative_area_level_5':
					if (city === '') {
						city = val;
					}
					break;
				case 'route':
				case 'intersection':
					if (streetName === '') {
						streetName = val;
					}
					break;
				case 'street_number':
					streetNumber = val;
					break;
				case 'postal_code':
					postcode = val;
					break;
			}
		});

		this.setFormLocationValues(
			countryId,
			city,
			streetName,
			streetNumber,
			postcode
		);
	}

	private setFormLocationValues(
		countryId,
		city,
		streetName,
		streetNumber,
		postcode
	) {
		if (!isEmpty(countryId)) {
			this.countryId.setValue(Country[countryId].toString());
		}
		if (!isEmpty(city)) {
			this.city.setValue(city);
		}
		if (!isEmpty(streetName)) {
			this.streetAddress.setValue(streetName);
		}
		if (!isEmpty(streetNumber)) {
			this.house.setValue(streetNumber);
		}
	}

	private listenForGoogleAutocompleteAddressChanges(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete.addListener('place_changed', (_) => {
			const place: google.maps.places.PlaceResult = autocomplete.getPlace();
			this.applyNewPlaceOnTheMap(place);
		});
	}

	private setupGoogleAutocompleteOptions(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete['setFields'](['address_components', 'geometry']);
	}

	private initGoogleAutocompleteApi() {
		if (this.searchElement) {
			const autocomplete = new google.maps.places.Autocomplete(
				this.searchElement.nativeElement
			);

			this.setupGoogleAutocompleteOptions(autocomplete);

			this.listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
