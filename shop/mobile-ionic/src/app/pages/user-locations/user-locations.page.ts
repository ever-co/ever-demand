import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var google: any;
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { IonSearchbar } from '@ionic/angular';

const MAP_ZOOM = 17;
@Component({
	selector: 'e-cu-user-locations',
	templateUrl: './user-locations.page.html',
	styleUrls: ['./user-locations.page.css'],
})
export class UserLocationsPage implements OnInit {
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
				console.log(`result is ${JSON.stringify(res)}`);
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
			city: new FormControl(''),
			street: new FormControl(''),
			house: new FormControl(''),
			apartment: new FormControl(''),
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
			const autocomplete = new google.maps.places.Autocomplete(el);
			autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
			autocomplete.addListener('place_changed', () => {
				const place = autocomplete.getPlace();
				if (!place.geometry) { return; }
				if (place.geometry.viewport) {
					this.map.fitBounds(place.geometry.viewport);
				} else {
					this.map.setCenter(place.geometry.location);
					this.map.setZoom(MAP_ZOOM)
				}
				if (place.address_components) {
					this.addressForm.controls.street.setValue(place.address_components[1].long_name);
					this.addressForm.controls.city.setValue(place.address_components[0].long_name);
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
