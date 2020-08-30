import {
	Component,
	Input,
	EventEmitter,
	Output,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnInit,
} from '@angular/core';

import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';

import GeoLocation, {
	Country,
	getCountryName,
	countriesIdsToNamesArray,
} from '@modules/server.common/entities/GeoLocation';

import { pick, isEmpty } from 'lodash';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { FormHelpers } from '../../../forms/helpers';
import { TranslateService } from '@ngx-translate/core';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { AlertController } from '@ionic/angular';
import User from '@modules/server.common/entities/User';

@Component({
	selector: 'location-form',
	styleUrls: ['./location-form.component.scss'],
	templateUrl: './location-form.component.html',
})
export class LocationFormComponent implements OnInit, AfterViewInit {
	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	PREFIX: string = 'WAREHOUSE_VIEW.SELECT_POP_UP.';

	@Input()
	readonly form: FormGroup;

	@Input()
	readonly apartment?: AbstractControl;

	@Input()
	userData: User;

	@Input()
	showAutocompleteSearch: boolean = false;

	@Output()
	mapCoordinatesEmitter = new EventEmitter<
		google.maps.LatLng | google.maps.LatLngLiteral
	>();

	@Output()
	mapGeometryEmitter = new EventEmitter<
		google.maps.places.PlaceGeometry | google.maps.GeocoderGeometry
	>();

	@ViewChild('autocomplete')
	searchElement: ElementRef;

	showCoordinates: boolean = false;

	private _lastUsedAddressText: string;

	constructor(
		private readonly _alertController: AlertController,
		private translate: TranslateService,
		public readonly localeTranslateService: ProductLocalesService
	) {}

	get buttonOK() {
		return this._translate(this.PREFIX + this.OK);
	}

	get buttonCancel() {
		return this._translate(this.PREFIX + this.CANCEL);
	}

	get countries() {
		return countriesIdsToNamesArray;
	}

	get isCountryValid(): boolean {
		return (
			this.countryId.errors &&
			(this.countryId.dirty || this.countryId.touched)
		);
	}

	get isCityValid(): boolean {
		return this.city.errors && (this.city.dirty || this.city.touched);
	}

	get isStreetAddressValid(): boolean {
		return (
			this.streetAddress.errors &&
			(this.streetAddress.dirty || this.streetAddress.touched)
		);
	}

	get isHouseValid(): boolean {
		return this.house.errors && (this.house.dirty || this.house.touched);
	}

	get isLocationValid(): boolean {
		return (
			this.coordinates.errors &&
			(this.coordinates.dirty || this.coordinates.touched)
		);
	}

	get countryId() {
		return this.form.get('countryId');
	}

	get city() {
		return this.form.get('city');
	}

	get streetAddress() {
		return this.form.get('streetAddress');
	}

	get house() {
		return this.form.get('house');
	}

	get postcode() {
		return this.form.get('postcode');
	}

	get coordinates() {
		return this.form.get('loc').get('coordinates') as FormArray;
	}

	static buildForm(formBuilder: FormBuilder): FormGroup {
		const form = formBuilder.group({
			countryId: [Country.US],
			city: ['', [Validators.required]],
			streetAddress: ['', [Validators.required]],
			house: ['', [Validators.required]],
			postcode: [''],
			loc: formBuilder.group({
				type: ['Point'],
				coordinates: formBuilder.array([null, null]),
			}),
		});

		return form;
	}

	static buildApartmentForm(formBuilder: FormBuilder): AbstractControl {
		return formBuilder.control('');
	}

	ngOnInit(): void {
		this.loadData();
	}

	ngAfterViewInit() {
		this._initGoogleAutocompleteApi();
	}

	toggleCoordinates() {
		this.showCoordinates = !this.showCoordinates;
	}

	onAddressChanges() {
		if (this.showAutocompleteSearch) {
			this._tryFindNewAddress();
		}
	}

	onCoordinatesChanged() {
		if (this.showAutocompleteSearch) {
			this._tryFindNewCoordinates();
		}
	}

	getValue(): IGeoLocationCreateObject {
		const location = this.form.getRawValue() as IGeoLocationCreateObject;
		if (!location.postcode) {
			delete location.postcode;
		}
		return location;
	}

	getApartment(): string {
		// apartment is not part of geo location
		if (!this.apartment) {
			throw new Error("Form doesn't contain apartment");
		}
		return this.apartment.value as string;
	}

	setValue<T extends IGeoLocationCreateObject>(geoLocation: T) {
		FormHelpers.deepMark(this.form, 'dirty');

		this.form.setValue({
			postcode: geoLocation.postcode || '',
			...(pick(geoLocation, Object.keys(this.getValue())) as any),
		});

		// This setup the form and map with new received values.
		this._tryFindNewCoordinates();
	}

	setApartment(apartment: string) {
		this.apartment.setValue(apartment);
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translate.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
	}

	private async _applyFormattedAddress(address: string) {
		if (this.searchElement) {
			const inputElement = await this.searchElement['getInputElement']();
			inputElement.value = address;
		}
	}

	private _tryFindNewAddress() {
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

		if (newAddress !== this._lastUsedAddressText) {
			this._lastUsedAddressText = newAddress;

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

						this._applyNewPlaceOnTheMap(place);
						this._applyFormattedAddress(formattedAddress);
					}
				}
			);
		}
	}

	private _lat: number;
	private _lng: number;

	private _tryFindNewCoordinates() {
		const formCoordinates = this.coordinates.value;
		this._lat = formCoordinates[0];
		this._lng = formCoordinates[1];

		const geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{
				location: new google.maps.LatLng(this._lat, this._lng),
			},
			(results, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					const formattedAddress = results[0].formatted_address;
					const place = results[0];

					const useGeometryLatLng = false;
					this._applyNewPlaceOnTheMap(place, useGeometryLatLng);
					this._applyFormattedAddress(formattedAddress);
				}
			}
		);
	}

	private _emitCoordinates(
		location: google.maps.LatLng | google.maps.LatLngLiteral
	) {
		this.mapCoordinatesEmitter.emit(location);
	}

	private _emitGeometry(
		geometry:
			| google.maps.places.PlaceGeometry
			| google.maps.GeocoderGeometry
	) {
		this.mapGeometryEmitter.emit(geometry);
	}

	private async _popInvalidAddressMessage() {
		const alert = await this._alertController.create({
			message: 'Invalid address, please try again!',
		});
		await alert.present();

		setTimeout(() => alert.dismiss(), 2000);
	}

	private _setupGoogleAutocompleteOptions(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete['setFields'](['address_components', 'geometry']);
	}

	private _applyNewPlaceOnTheMap(
		place: google.maps.places.PlaceResult | google.maps.GeocoderResult,
		useGeometryLatLng: boolean = true
	) {
		if (place.geometry === undefined || place.geometry === null) {
			this._popInvalidAddressMessage();
			return;
		}

		if (useGeometryLatLng) {
			const loc = place.geometry.location;
			this._lat = loc.lat();
			this._lng = loc.lng();
		}

		// If the place has a geometry, then present it on a map.
		this._emitGeometry(place.geometry);

		this._emitCoordinates(new google.maps.LatLng(this._lat, this._lng));

		this._gatherAddressInformation(place);
	}

	private _listenForGoogleAutocompleteAddressChanges(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete.addListener('place_changed', (_) => {
			const place: google.maps.places.PlaceResult = autocomplete.getPlace();
			this._applyNewPlaceOnTheMap(place);
		});
	}

	private _gatherAddressInformation(
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

		this._setFormLocationValues(
			countryId,
			city,
			streetName,
			streetNumber,
			postcode
		);
	}

	private async _initGoogleAutocompleteApi() {
		if (this.searchElement) {
			const inputElement = await this.searchElement['getInputElement']();

			const autocomplete = new google.maps.places.Autocomplete(
				inputElement
			);

			this._setupGoogleAutocompleteOptions(autocomplete);

			this._listenForGoogleAutocompleteAddressChanges(autocomplete);
		}
	}

	private _setFormLocationValues(
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
		if (!isEmpty(postcode)) {
			this.postcode.setValue(postcode);
		}
		if (!isEmpty(streetName)) {
			this.streetAddress.setValue(streetName);
		}
		if (!isEmpty(streetNumber)) {
			this.house.setValue(streetNumber);
		}

		this.coordinates.setValue([this._lat, this._lng]);
	}

	private loadData() {
		if (this.userData) {
			const userGeoLocation: GeoLocation = new GeoLocation(
				this.userData.geoLocation
			);

			this.city.setValue(userGeoLocation.city);
			this.streetAddress.setValue(userGeoLocation.streetAddress);
			this.house.setValue(userGeoLocation.house);
			this.coordinates.setValue([
				userGeoLocation.coordinates.lat,
				userGeoLocation.coordinates.lng,
			]);
			this.countryId.setValue(userGeoLocation.countryId.toString());
			this.postcode.setValue(userGeoLocation.postcode);

			this.apartment.setValue(this.userData.apartment);

			this._tryFindNewCoordinates();
		}
	}
}
