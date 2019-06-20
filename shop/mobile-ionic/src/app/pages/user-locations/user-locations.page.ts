import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Geoposition } from '@ionic-native/geolocation';
declare var google: any;
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'e-cu-user-locations',
	templateUrl: './user-locations.page.html',
	styleUrls: ['./user-locations.page.css'],
})
export class UserLocationsPage implements OnInit {
	@ViewChild('container', { static: false }) container: ElementRef;
	public latitude: number;
	public longitude: number;
	public map: google.maps.Map;
	public form: FormGroup;
	public searchForm: FormGroup;
	public service;

	constructor(private geolocation: Geolocation, private formBuilder: FormBuilder) { }

	ngOnInit() {
		this.createForm();
		this.createSearchForm();
		this.geolocation.getCurrentPosition().then((_res: Geoposition) => {
			this.latitude = _res.coords.latitude;
			this.longitude = _res.coords.longitude;
			this.loadMap();
		});
	}

	watchUserSearch() {
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

	createForm() {
		this.form = this.formBuilder.group({
			city: new FormControl(''),
			street: new FormControl(''),
			house: new FormControl(''),
			apartment: new FormControl(''),
		});
	}

	loadMap() {
		const settings = this.configureMapSettings();
		this.map = new google.maps.Map(this.container.nativeElement, this.configureMapSettings());
		this.service = new google.maps.places.PlacesService(this.map);
		this.watchUserSearch();
		new google.maps.Marker({ position: settings.center, map: this.map })

	}

	configureMapSettings() {
		return {
			zoom: 17,
			center: { lat: this.latitude, lng: this.longitude },
			mapTypeControl: false,
			streetViewControl: false
		};
	}
}
