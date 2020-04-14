import {
	Component,
	Input,
	OnInit,
	OnChanges,
	OnDestroy,
	ViewChild,
	ElementRef,
	EventEmitter,
} from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import {
	FormBuilder,
	FormGroup,
	AbstractControl,
	Validators,
} from '@angular/forms';
import {
	Country,
	CountryName,
	countriesIdsToNamesArray,
	getCountryName,
} from '@modules/server.common/entities/GeoLocation';
import { isEmpty } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'merchant-location',
	templateUrl: 'location.html',
})
export class LocationComponent implements OnInit, OnChanges, OnDestroy {
	OK: string = 'OK';
	CANCEL: string = 'CANCEL';
	PREFIX: string = 'SETTINGS_VIEW.';
	locationForm: FormGroup;
	country: AbstractControl;
	city: AbstractControl;
	postcode: AbstractControl;
	street: AbstractControl;
	house: AbstractControl;
	apartment: AbstractControl;
	autodetectCoordinates: AbstractControl;
	latitude: AbstractControl;
	longitude: AbstractControl;

	map: google.maps.Map;

	@ViewChild('autocomplete', { static: true })
	searchElement: ElementRef;

	mapCoordEmitter = new EventEmitter<google.maps.LatLng>();

	mapGeometryEmitter = new EventEmitter<
		google.maps.GeocoderGeometry | google.maps.places.PlaceGeometry
	>();

	@Input()
	private currWarehouse: Warehouse;

	private _lastUsedAddress: string;

	constructor(
		private formBuilder: FormBuilder,
		private warehouseRouter: WarehouseRouter,
		public alertController: AlertController,
		private translate: TranslateService
	) {
		this.buildForm();
		this.bindFormControls();
	}

	get countries(): Array<{ id: Country; name: CountryName }> {
		return countriesIdsToNamesArray;
	}

	ngOnChanges(): void {
		if (this.currWarehouse) {
			this.country.setValue(
				this.currWarehouse.geoLocation.countryId.toString()
			);
			this.city.setValue(this.currWarehouse.geoLocation.city);
			this.postcode.setValue(this.currWarehouse.geoLocation.postcode);
			this.street.setValue(this.currWarehouse.geoLocation.streetAddress);
			this.house.setValue(this.currWarehouse.geoLocation.house);
			this.apartment.setValue(this.currWarehouse.geoLocation.apartment);
			// here is used hardcode value in coordinates because from interface in Geolocation we are sure
			// that in array coordinated on first position is lat and on second is long
			this.latitude.setValue(
				this.currWarehouse.geoLocation.coordinates.lat
			);
			this.longitude.setValue(
				this.currWarehouse.geoLocation.coordinates.lng
			);
		}
	}

	ngOnInit(): void {
		this._initGoogleAutocompleteApi();
		this._tryFindNewCoordinates();
	}

	get buttonOK() {
		return this._translate(this.PREFIX + this.OK);
	}

	get buttonCancel() {
		return this._translate(this.PREFIX + this.CANCEL);
	}

	async saveChanges() {
		this.prepareUpdate();
		const warehouse = await this.warehouseRouter.save(this.currWarehouse);
		const alert = await this.alertController.create({
			cssClass: 'success-info',
			message: 'Successfully saved changes',
			buttons: ['OK'],
		});

		await alert.present();
	}

	prepareUpdate() {
		this.currWarehouse.geoLocation.countryId = this.country.value;
		this.currWarehouse.geoLocation.city = this.city.value;
		this.currWarehouse.geoLocation.postcode = this.postcode.value;
		this.currWarehouse.geoLocation.streetAddress = this.street.value;
		this.currWarehouse.geoLocation.house = this.house.value;
		this.currWarehouse.geoLocation.apartment = this.apartment.value;
		this.currWarehouse.geoLocation.loc = {
			type: 'Point',
			coordinates: [this.longitude.value, this.latitude.value],
		};
	}

	bindFormControls() {
		this.country = this.locationForm.get('country');
		this.city = this.locationForm.get('city');
		this.postcode = this.locationForm.get('postcode');
		this.street = this.locationForm.get('street');
		this.house = this.locationForm.get('house');
		this.apartment = this.locationForm.get('apartment');
		this.autodetectCoordinates = this.locationForm.get(
			'autodetectCoordinates'
		);
		this.latitude = this.locationForm.get('latitude');
		this.longitude = this.locationForm.get('longitude');
	}

	buildForm() {
		this.locationForm = this.formBuilder.group({
			country: ['', Validators.required],
			city: ['', Validators.required],
			postcode: [''],
			street: ['', Validators.required],
			house: ['', Validators.required],
			apartment: [''],
			autodetectCoordinates: [true],
			latitude: ['', Validators.required],
			longitude: ['', Validators.required],
		});
	}

	textInputChange(val, input) {
		if (input === 'latitude' || input === 'longitude') {
			this._tryFindNewCoordinates();
		} else if (input !== 'apartment') {
			this._tryFindNewAddress();
		}
	}

	private _tryFindNewCoordinates() {
		const geocoder = new google.maps.Geocoder();

		geocoder.geocode(
			{
				location: new google.maps.LatLng(
					this.latitude.value,
					this.longitude.value
				),
			},
			(res, status) => {
				if (status === google.maps.GeocoderStatus.OK) {
					const location = res[0].geometry.location;
					this.mapCoordEmitter.emit(location);

					const place = res[0];
					this._applyNewPlaceOnTheMap(place);
				}
			}
		);
	}

	private _applyNewPlaceOnTheMap(
		locationResult:
			| google.maps.GeocoderResult
			| google.maps.places.PlaceResult
	) {
		if (
			locationResult.geometry === undefined ||
			locationResult.geometry === null
		) {
			return;
		}

		const loc = locationResult.geometry.location;

		this.latitude.setValue(loc.lat());
		this.longitude.setValue(loc.lng());

		this.mapCoordEmitter.emit(loc);
		this.mapGeometryEmitter.emit(locationResult.geometry);
		this._gatherAddressInformation(locationResult);
	}

	private _translate(key: string): string {
		let translationResult = '';

		this.translate.get(key).subscribe((res) => {
			translationResult = res;
		});

		return translationResult;
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
		let streetNumber = '';
		let country = '';
		let postcode = '';
		let city = '';

		locationResult.address_components.forEach((address) => {
			const addressType = address.types[0];
			const addressTypeKey = neededAddressTypes[addressType];

			const val = address[addressTypeKey];

			switch (addressType) {
				case 'country':
					country = val;
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
			country,
			city,
			streetName,
			streetNumber,
			postcode
		);
	}

	private _setFormLocationValues(
		country,
		city,
		streetName,
		streetNumber,
		postcode
	) {
		if (!isEmpty(country)) {
			this.country.setValue(Country[country].toString());
		}
		if (!isEmpty(city)) {
			this.city.setValue(city);
		}
		if (!isEmpty(streetName)) {
			this.street.setValue(streetName);
		}
		if (!isEmpty(streetNumber)) {
			this.house.setValue(streetNumber);
		}
		if (!isEmpty(postcode)) {
			this.postcode.setValue(postcode);
		}
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

	private _setupGoogleAutocompleteOptions(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete.setComponentRestrictions({ country: ['us', 'bg', 'il'] });
		autocomplete['setFields'](['address_components', 'geometry']);
	}

	private _listenForGoogleAutocompleteAddressChanges(
		autocomplete: google.maps.places.Autocomplete
	) {
		autocomplete.addListener('place_changed', (_) => {
			const place: google.maps.places.PlaceResult = autocomplete.getPlace();
			this._applyNewPlaceOnTheMap(place);
		});
	}

	private _tryFindNewAddress() {
		const house = this.house.value;
		const city = this.city.value;
		const streetAddress = this.street.value;
		const countryName = getCountryName(+this.country.value);

		if (
			isEmpty(streetAddress) ||
			isEmpty(house) ||
			isEmpty(city) ||
			isEmpty(countryName)
		) {
			return;
		}

		const newAddress = `${house}${streetAddress}${city}${countryName}`;

		if (newAddress !== this._lastUsedAddress) {
			this._lastUsedAddress = newAddress;

			const geocoder = new google.maps.Geocoder();

			geocoder.geocode(
				{
					address: `${streetAddress} ${house}, ${city}`,
					componentRestrictions: { country: countryName },
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

	private async _applyFormattedAddress(address: string) {
		if (this.searchElement) {
			const inputElement = await this.searchElement['getInputElement']();
			inputElement.value = address;
		}
	}

	ngOnDestroy(): void {}
}
