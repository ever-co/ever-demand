import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var google: any;
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonSearchbar } from '@ionic/angular';

const MAP_ZOOM = 17;

@Component({
	selector: 'e-cu-new-address',
	templateUrl: './new-address.page.html',
	styleUrls: ['./new-address.page.css'],
})
export class NewAddressPage implements OnInit {

	@ViewChild('container', { static: false }) container: ElementRef;
	@ViewChild(IonSearchbar, { static: false }) locationInput: IonSearchbar;
	public latitude: number;
	public longitude: number;
	public map: google.maps.Map;
	public addressForm: FormGroup;
	public searchForm: FormGroup;
	public service;

	constructor(private geolocation: Geolocation, private formBuilder: FormBuilder) { }

	ngOnInit() {
		this.createAddressForm();
		this.createSearchForm();
		this.geolocation.getCurrentPosition().then(_res => {
			this.latitude = _res.coords.latitude;
			this.longitude = _res.coords.longitude;
			this.loadMap();
		});
	}

	watchUserSearch() {
		this.service = new google.maps.places.PlacesService(this.map);
		this.searchForm.get('searchLocation').valueChanges.subscribe(value => {
			this.service.findPlaceFromQuery({
				query: this.searchForm.get('searchLocation').value,
				fields: ['name', 'geometry']
			}, (res, status) => {
				this.map.setCenter(res[0].geometry.location);
			});
		});
	}

	createSearchForm() {
		this.searchForm = this.formBuilder.group({
			searchLocation: new FormControl()
		});
	}

	createAddressForm() {
		this.addressForm = this.formBuilder.group({
			locality: new FormControl('', [Validators.required]),
			street_number: new FormControl('', [Validators.required]),
			house: new FormControl('', [Validators.required]),
			apartment: new FormControl('', [Validators.required]),
		});
	}

	loadMap() {
		const settings = this.configureMapSettings();
		this.map = new google.maps.Map(this.container.nativeElement, this.configureMapSettings());
		new google.maps.Marker({ position: settings.center, map: this.map })
		this.watchUserSearch();
		this.configureAutoComplete();
	}

	configureAutoComplete() {
		this.locationInput.getInputElement().then(el => {
			const options = { types: ['geocode'] };
			const autocomplete = new google.maps.places.Autocomplete(el, options);
			autocomplete.setFields(['address_components', 'geometry', 'formatted_address']);
			autocomplete.addListener('place_changed', () => {
				const place = autocomplete.getPlace();
				if (!place.geometry) { return; }
				this.map.setCenter(place.geometry.location);
				this.map.setZoom(MAP_ZOOM)
				if (place.formatted_address) {
					this.searchForm.controls.searchLocation.setValue(place.formatted_address);
				}
				if (place.address_components) {
					for (let i = 0; i < place.address_components.length; i++) {
						const addressType = place.address_components[i].types[0];
						if (this.addressForm.controls[addressType]) {
							this.addressForm.controls[addressType].setValue(place.address_components[i]['long_name']);
						}
					}
				}
			});
		})
	}

	configureMapSettings() {
		return {
			zoom: MAP_ZOOM,
			center: { lat: this.latitude, lng: this.longitude },
			mapTypeControl: false,
			streetViewControl: false
		};
	}
}
