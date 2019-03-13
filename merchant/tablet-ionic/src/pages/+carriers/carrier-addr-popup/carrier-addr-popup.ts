import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'carrier-addr-popup',
	templateUrl: 'carrier-addr-popup.html',
	styleUrls: ['./carrier-addr-popup.scss']
})
export class CarrierAddrPopupPage implements OnInit {
	@ViewChild('gmap')
	gmapElement: ElementRef;

	map: google.maps.Map;

	myLatLng = { lat: 0, lng: 0 };

	@Input()
	geoLocation: GeoLocation;

	private city: any;
	private country: any;
	private street: any;
	private house: any;
	private apartment: any;
	private coordinates: any;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		const geoLocation = this.geoLocation;

		this.city = geoLocation.city;

		this.country = geoLocation.countryName;

		this.street = geoLocation.streetAddress;

		this.house = geoLocation.house;

		this.coordinates = [
			geoLocation.coordinates.lat,
			geoLocation.coordinates.lng
		];

		this.myLatLng.lat = this.coordinates[0];

		this.myLatLng.lng = this.coordinates[1];

		this.loadMap();
	}

	loadMap() {
		const mapProp = {
			center: this.myLatLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		const marker = new google.maps.Marker({
			position: this.myLatLng,
			map: this.map,
			title: 'Your Warehouse!'
		});
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}
}
