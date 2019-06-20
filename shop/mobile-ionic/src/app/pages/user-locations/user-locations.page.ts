import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Geoposition } from '@ionic-native/geolocation';
declare var google: any;

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

	constructor(private geolocation: Geolocation) { }

	ngOnInit() {
		this.geolocation.getCurrentPosition().then((_res: Geoposition) => {
			this.latitude = _res.coords.latitude;
			this.longitude = _res.coords.longitude;
			this.loadMap();
		});
	}


	loadMap() {
		this.map = new google.maps.Map(this.container.nativeElement, this.configureMapSettings());
	}

	configureMapSettings() {
		return {
			zoom: 17,
			center: { lat: this.latitude, lng: this.longitude },
			mapTypeControl: false,
			streetViewControl: false
		};
	}

	updateMap() {
	}
}
