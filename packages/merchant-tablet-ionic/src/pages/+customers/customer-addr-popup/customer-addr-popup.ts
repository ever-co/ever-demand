import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import User from '@modules/server.common/entities/User';

@Component({
	selector: 'customer-addr-popup',
	templateUrl: 'customer-addr-popup.html',
	styleUrls: ['./customer-addr-popup.scss'],
})
export class CustomerAddrPopupPage implements OnInit {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;
	map: google.maps.Map;
	myLatLng = { lat: 0, lng: 0 };

	@Input()
	user: User;

	city: string;
	country: string;
	street: string;
	house: string;
	apartment: string;
	coordinates: number[];

	constructor(public modalController: ModalController) {}

	get coordinatesStr() {
		return this.user
			? this.user.geoLocation.loc.coordinates
					.map((c) => c.toFixed(6))
					.reverse()
					.join(', ')
			: '';
	}

	ngOnInit(): void {
		const user = this.user;
		this.city = user.geoLocation.city;
		this.country = user.geoLocation.countryName;
		this.street = user.geoLocation.streetAddress;
		this.house = user.geoLocation.house;
		this.apartment = user.apartment;

		// We use reverse because MongoDB store lnt => lat
		this.coordinates = Array.from(
			user.geoLocation.loc.coordinates
		).reverse();

		this.myLatLng.lat = this.coordinates[0];
		this.myLatLng.lng = this.coordinates[1];

		this.loadMap();
	}

	loadMap() {
		const mapProp = {
			center: this.myLatLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		const marker = new google.maps.Marker({
			position: this.myLatLng,
			map: this.map,
			title: 'Your Warehouse!',
		});
	}

	cancelModal() {
		this.modalController.dismiss();
	}
}
