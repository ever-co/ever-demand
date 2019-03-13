import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';

import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierService } from '../../../../src/services/carrier.service';
import { ModalController } from '@ionic/angular';

declare var google: any;

const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	selector: 'carrier-track-popup',
	templateUrl: 'carrier-track-popup.html',
	styleUrls: ['./carrier-track-popup.scss']
})
export class CarrierTrackPopup implements OnInit {
	@ViewChild('gmap')
	gmapElement: ElementRef;

	@Input()
	carrier: Carrier;

	map: google.maps.Map;

	myLatLng = { lat: 0, lng: 0 };

	private coordinates: any;

	constructor(
		public modalCtrl: ModalController,
		private carriersService: CarrierService
	) {}

	ngOnInit(): void {
		const geoLocation = this.carrier.geoLocation;

		this.coordinates = [
			geoLocation.coordinates.lat,
			geoLocation.coordinates.lng
		];

		this.myLatLng.lat = this.coordinates[0];
		this.myLatLng.lng = this.coordinates[1];

		this.loadMap();
	}

	async loadMap() {
		const mapProp = {
			center: this.myLatLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		const storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
		const userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';
		const carrierIcon =
			'http://maps.google.com/mapfiles/kml/pal4/icon54.png';

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		if (this.carrier.status !== 0) {
			const carrierMarker = this.addMarker(
				this.myLatLng,
				this.map,
				carrierIcon
			);

			const carrierInfoContent = `
                <div class="carrier-track-carrier-info">
					<h3>  ${this.carrier.fullName}</h3>
					<ul>
						<li>${this.carrier.username}</li>
						<li><i style='margin-right:5px;' class="fa fa-phone"></i>${
							this.carrier.phone
						}</li>
						<li><i style='margin-right:5px;' class="fa fa-address-card"></i>${
							this.carrier.geoLocation.streetAddress
						}</li>
                    </ul>
                </div>
					`;

			const carrierInfoWindow = new google.maps.InfoWindow({
				content: carrierInfoContent
			});

			carrierMarker.addListener('click', () => {
				carrierInfoWindow.open(this.map, carrierMarker);
			});
		} else if (this.carrier.status === 0) {
			const order = await this.carriersService.getCarrierCurrentOrder(
				this.carrier.id
			);

			const user = order.user;

			const warehouse = order.warehouse;

			const warehouseMarker = this.addMarker(
				{
					lat: warehouse.geoLocation.loc.coordinates[1],
					lng: warehouse.geoLocation.loc.coordinates[0]
				},
				this.map,
				storeIcon
			);

			const userMarker = this.addMarker(
				{
					lat: user.geoLocation.loc.coordinates[1],
					lng: user.geoLocation.loc.coordinates[0]
				},
				this.map,
				userIcon
			);

			const warehouseInfoContent = `
                                <div class="carrier-info">
									<h3>  ${warehouse.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="fa fa-envelope-open"></i>
											${warehouse.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-phone"></i>
											${warehouse.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-address-card"></i>
											${warehouse.streetAddress}
										</li>
                                    </ul>
                                </div>
									`;

			const warehouseInfoWindow = new google.maps.InfoWindow({
				content: warehouseInfoContent
			});

			warehouseMarker.addListener('click', () => {
				warehouseInfoWindow.open(this.map, warehouseMarker);
			});

			// TODO: put into separate userInfo control
			const userInfoContent = `
                                <div class="carrier-info">
									<h3>  ${user.firstName + ' ' + user.lastName}</h3>
									<ul>
										<li><i style='margin-right:5px;' class="fa fa-envelope-open"></i>${
											user.email
										}</li>
                                            <li><i style='margin-right:5px;' class="fa fa-phone"></i>${
												user.phone
											}</li>
										<li><i style='margin-right:5px;' class="fa fa-address-card"></i>${
											user.geoLocation.streetAddress
										}</li>
                                    </ul>
                                <div class="carrier-info">
									`;

			const userInfoWindow = new google.maps.InfoWindow({
				content: userInfoContent
			});

			userMarker.addListener('click', () => {
				userInfoWindow.open(this.map, userMarker);
			});

			const start = new google.maps.LatLng(
				user.geoLocation.loc.coordinates[1],
				user.geoLocation.loc.coordinates[0]
			);

			const end = new google.maps.LatLng(
				warehouse.geoLocation.loc.coordinates[1],
				warehouse.geoLocation.loc.coordinates[0]
			);

			const request = {
				origin: start,
				destination: end,
				travelMode: 'DRIVING'
			};

			directionsService.route(request, function(res, stat) {
				if (stat === 'OK') {
					directionsDisplay.setDirections(res);
				}
			});

			directionsDisplay.setOptions({
				suppressMarkers: true
			});

			directionsDisplay.setMap(this.map);
		}
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon
		});
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}
}
