import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var google: any;
import {
	FormBuilder,
	FormGroup,
	FormControl,
	Validators,
} from '@angular/forms';
import { GeoLocationService } from '../../services/geo-location';
import { UsersService } from '../../services/users/users.service';
import { Location } from '@angular/common';
//import { UsersService } from '../../../ services/src/services/users/UsersService.ts';

import { IonSearchbar } from '@ionic/angular';
import User from '@modules/server.common/entities/User';

const MAP_ZOOM = 16;

@Component({
	selector: 'e-cu-new-address',
	templateUrl: './customer-addresses.page.html',
	styleUrls: ['./customer-addresses.page.scss'],
})
export class CustomerAddressesPage implements OnInit {
	@ViewChild('container', { static: false }) container: ElementRef;
	@ViewChild(IonSearchbar, { static: false }) locationInput: IonSearchbar;
	public latitude: number;
	public longitude: number;
	public map: google.maps.Map;
	public addressForm: FormGroup;
	public searchForm: FormGroup;
	public service;
	public isOtherAddress: boolean = false;

	selectedSegment: any = 'home';

	public _currCustomer: User;

	constructor(
		private formBuilder: FormBuilder,
		private geoLocationService: GeoLocationService,
		private usersService: UsersService,
		private location: Location
	) {}

	goBack() {
		this.location.back();
	}

	ngOnInit() {
		this.createAddressForm();
		this.createSearchForm();
		// this.geoLocationService.getCurrentCoordsFromDeviceGPS().then((_res) => {
		// 	this.latitude = _res.latitude;
		// 	this.longitude = _res.longitude;
		// 	this.loadMap();
		// });
	}

	createSearchForm() {
		this.searchForm = this.formBuilder.group({
			searchLocation: new FormControl(),
		});
	}

	createAddressForm() {
		this.addressForm = this.formBuilder.group({
			locality: new FormControl('', [Validators.required]),
			street_number: new FormControl('', [Validators.required]),
			house: new FormControl('', [Validators.required]),
			apartment: new FormControl('', [Validators.required]),
			country: new FormControl('', [Validators.required]),
			postal_code: new FormControl('', [Validators.required]),
			address_name: new FormControl('home'),
			latitude: new FormControl(''),
			longitude: new FormControl(''),
		});
	}

	loadMap() {
		const settings = this.configureMapSettings();
		this.map = new google.maps.Map(
			this.container.nativeElement,
			this.configureMapSettings()
		);
		new google.maps.Marker({ position: settings.center, map: this.map });
		this.watchUserSearch();
		this.configureAutoComplete();
	}

	watchUserSearch() {
		this.service = new google.maps.places.PlacesService(this.map);
		this.searchForm
			.get('searchLocation')
			.valueChanges.subscribe((value) => {
				this.service.findPlaceFromQuery(
					{
						query: this.searchForm.get('searchLocation').value,
						fields: ['name', 'geometry'],
					},
					(res, status) => {
						if (res !== null)
							this.map.setCenter(res[0].geometry.location);
					}
				);
			});
	}

	configureAutoComplete() {
		this.locationInput.getInputElement().then((el) => {
			const options = { types: ['geocode'] };
			const autocomplete = new google.maps.places.Autocomplete(
				el,
				options
			);
			autocomplete.setFields([
				'address_components',
				'geometry',
				'formatted_address',
			]);
			autocomplete.addListener('place_changed', () => {
				const place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}
				this.map.setCenter(place.geometry.location);
				this.map.setZoom(MAP_ZOOM);
				if (place.formatted_address) {
					this.searchForm.controls.searchLocation.setValue(
						place.formatted_address
					);
				}
				if (place.address_components) {
					for (let i = 0; i < place.address_components.length; i++) {
						const addressType =
							place.address_components[i].types[0];
						if (this.addressForm.controls[addressType]) {
							this.addressForm.controls[addressType].setValue(
								place.address_components[i]['long_name']
							);
						}
					}
				}
			});
		});
	}

	configureMapSettings() {
		return {
			zoom: MAP_ZOOM,
			center: { lat: this.latitude, lng: this.longitude },
			mapTypeControl: false,
			streetViewControl: false,
		};
	}

	saveNewAddress() {
		let userId = localStorage.getItem('_userId');
		let objectToUpdate = {
			locality: this.addressForm.value.locality,
			street_number: this.addressForm.value.street_number,
			house: this.addressForm.value.house,
			apartment: this.addressForm.value.apartment,
			country: this.addressForm.value.country,
			postal_code: this.addressForm.value.postal_code,
			address_name: this.addressForm.value.address_name,
			latitude: this.latitude,
			longitude: this.longitude,
			isPrimaryAddress: true,
		};

		// this.usersService
		// 	.updateUserAddress(userId, objectToUpdate)
		// 	.subscribe((res) => {
		// 		console.log(res);
		// 	});
	}

	addressName() {
		if (this.addressForm.value.address_name == '') {
			this.isOtherAddress = true;
		} else {
			this.isOtherAddress = false;
		}
	}
}
