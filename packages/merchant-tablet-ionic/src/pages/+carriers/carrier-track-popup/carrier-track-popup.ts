import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';

import Carrier from '@modules/server.common/entities/Carrier';
import { CarrierService } from '../../../../src/services/carrier.service';
import { ModalController } from '@ionic/angular';
import { WarehousesService } from '../../../../src/services/warehouses.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import User from '@modules/server.common/entities/User';

declare var google: any;

const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	selector: 'carrier-track-popup',
	templateUrl: 'carrier-track-popup.html',
	styleUrls: ['./carrier-track-popup.scss'],
})
export class CarrierTrackPopup implements OnInit {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;

	@Input()
	carrier: Carrier;

	map: google.maps.Map;

	myLatLng = { lat: 0, lng: 0 };

	private coordinates: any;
	warehouse: Warehouse;
	user: User;
	storeIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
	userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';
	carrierIcon = 'http://maps.google.com/mapfiles/kml/pal4/icon54.png';

	constructor(
		public modalCtrl: ModalController,
		private carriersService: CarrierService,
		private warehouseService: WarehousesService
	) {}

	ngOnInit(): void {
		const geoLocation = this.carrier.geoLocation;

		this.coordinates = [
			geoLocation.coordinates.lat,
			geoLocation.coordinates.lng,
		];

		this.myLatLng.lat = this.coordinates[0];
		this.myLatLng.lng = this.coordinates[1];

		this.loadMap();
	}

	get warehouseId() {
		return localStorage.getItem('_warehouseId');
	}

	async loadMap() {
		const mapProp = {
			center: this.myLatLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};

		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

		const carrierInfoContent = `
		<div class="carrier-track-carrier-info">
			<h3>  ${this.carrier.fullName}</h3>
			<ul>
				<li>${this.carrier.username}</li>
				<li><i style='margin-right:5px;' class="fa fa-phone"></i>${this.carrier.phone}</li>
				<li><i style='margin-right:5px;' class="fa fa-address-card"></i>${this.carrier.geoLocation.streetAddress}</li>
			</ul>
		</div>
			`;

		this.warehouse = await this.warehouseService
			.getStoreById(this.warehouseId)
			.toPromise();

		if (this.carrier.status !== 0) {
			const carrierMarker = this.addMarker(
				this.myLatLng,
				this.map,
				this.carrierIcon
			);

			const carrierInfoWindow = new google.maps.InfoWindow({
				content: carrierInfoContent,
			});
			carrierMarker.addListener('click', () => {
				carrierInfoWindow.open(this.map, carrierMarker);
			});
			const warehouseInfoContent = `
                                <div class="carrier-info">
									<h3>  ${this.warehouse.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="fa fa-envelope-open"></i>
											${this.warehouse.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-phone"></i>
											${this.warehouse.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-address-card"></i>
											${this.warehouse.geoLocation.streetAddress}
										</li>
                                    </ul>
                                </div>
									`;

			const warehouseInfoWindow = new google.maps.InfoWindow({
				content: warehouseInfoContent,
			});

			const warehouseMarker = this.addMarker(
				{
					lat: this.warehouse.geoLocation.loc.coordinates[1],
					lng: this.warehouse.geoLocation.loc.coordinates[0],
				},
				this.map,
				this.storeIcon
			);

			warehouseMarker.addListener('click', () => {
				warehouseInfoWindow.open(this.map, warehouseMarker);
			});
		} else if (this.carrier.status === 0) {
			const order = await this.carriersService.getCarrierCurrentOrder(
				this.carrier.id
			);

			const carrierMarker = this.addMarker(
				this.myLatLng,
				this.map,
				this.carrierIcon
			);

			const carrierInfoWindow = new google.maps.InfoWindow({
				content: carrierInfoContent,
			});
			carrierMarker.addListener('click', () => {
				carrierInfoWindow.open(this.map, carrierMarker);
			});

			const warehouseMarker = this.addMarker(
				{
					lat: this.warehouse.geoLocation.loc.coordinates[1],
					lng: this.warehouse.geoLocation.loc.coordinates[0],
				},
				this.map,
				this.storeIcon
			);

			const warehouseInfoContent = `
                                <div class="carrier-info">
									<h3>  ${this.warehouse.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="fa fa-envelope-open"></i>
											${this.warehouse.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-phone"></i>
											${this.warehouse.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="fa fa-address-card"></i>
											${this.warehouse.geoLocation.streetAddress}
										</li>
                                    </ul>
                                </div>
									`;

			const warehouseInfoWindow = new google.maps.InfoWindow({
				content: warehouseInfoContent,
			});

			warehouseMarker.addListener('click', () => {
				warehouseInfoWindow.open(this.map, warehouseMarker);
			});

			// TODO: put into separate userInfo control

			if (order) {
				this.user = order.user;
				const userMarker = this.addMarker(
					{
						lat: this.user.geoLocation.loc.coordinates[1],
						lng: this.user.geoLocation.loc.coordinates[0],
					},
					this.map,
					this.userIcon
				);
				const userInfoContent = `
                                <div class="carrier-info">
									<h3>  ${this.user.firstName + ' ' + this.user.lastName}</h3>
									<ul>
										<li><i style='margin-right:5px;' class="fa fa-envelope-open"></i>${
											this.user.email
										}</li>
                                             <li><i style='margin-right:5px;' class="fa fa-phone"></i>${
													this.user.phone
												}</li>
										<li><i style='margin-right:5px;' class="fa fa-address-card"></i>${
											this.user.geoLocation.streetAddress
										}</li>
                                    </ul>
                                <div class="carrier-info">
									`;

				const userInfoWindow = new google.maps.InfoWindow({
					content: userInfoContent,
				});

				userMarker.addListener('click', () => {
					userInfoWindow.open(this.map, userMarker);
				});
				const start = new google.maps.LatLng(
					this.user.geoLocation.loc.coordinates[1],
					this.user.geoLocation.loc.coordinates[0]
				);

				const end = new google.maps.LatLng(
					this.warehouse.geoLocation.loc.coordinates[1],
					this.warehouse.geoLocation.loc.coordinates[0]
				);

				const request = {
					origin: start,
					destination: end,
					travelMode: 'DRIVING',
				};

				directionsService.route(request, function (res, stat) {
					if (stat === 'OK') {
						directionsDisplay.setDirections(res);
					}
				});

				directionsDisplay.setOptions({
					suppressMarkers: true,
				});

				directionsDisplay.setMap(this.map);
			}
		}
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon,
		});
	}

	cancelModal() {
		this.modalCtrl.dismiss();
	}
}
