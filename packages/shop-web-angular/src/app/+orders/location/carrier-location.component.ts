import { Component, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { Subject } from 'rxjs';
//import 'style-loader!leaflet/dist/leaflet.css';
import { ActivatedRoute } from '@angular/router';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { first } from 'rxjs/operators';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { ICarrierOrdersRouterGetOptions } from '@modules/server.common/routers/ICarrierOrdersRouter';
import { environment } from 'environments/environment';
import { CarriersService } from '@app/@core/data/carriers.service';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare var google: any;
const directionsDisplay = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();

@Component({
	selector: 'ea-carrier-location',
	styleUrls: ['./carrier-location.component.scss'],
	templateUrl: './carrier-location.component.html',
})
export class CarrierLocationComponent implements OnInit {
	private ngDestroy$ = new Subject();

	@ViewChild('gmap', { static: true })
	gmapElement: any;
	map: google.maps.Map;
	marker: any;
	userMarker: any;
	warehouseMarker: any;
	carrierLoc: any;
	storeLoc: any;
	userOrder: any;
	constructor(
		private dialogRef: MatDialogRef<CarrierLocationComponent>,
		@Inject(MAT_DIALOG_DATA)
		data
	) {
		this.carrierLoc = data.carrier;
		this.storeLoc = data.merchant;
		this.userOrder = data.userOrder;
	}

	ngOnInit(): void {
		this.showMap();
		this.showIconsOnMap();
	}

	showIconsOnMap() {
		const newCoordinates = new google.maps.LatLng(
			this.carrierLoc.geoLocation.coordinates.lat,
			this.carrierLoc.geoLocation.coordinates.lng
		);

		const warehouseIcon =
			'http://maps.google.com/mapfiles/kml/pal3/icon21.png';
		const userIcon = 'http://maps.google.com/mapfiles/kml/pal3/icon48.png';

		this.userMarker = this.addMarker(
			new google.maps.LatLng(
				this.userOrder.geoLocation.coordinates.lat,
				this.userOrder.geoLocation.coordinates.lng
			),
			this.map,
			userIcon
		);

		this.warehouseMarker = this.addMarker(
			new google.maps.LatLng(
				this.storeLoc.geoLocation.coordinates.lat,
				this.storeLoc.geoLocation.coordinates.lng
			),
			this.map,
			warehouseIcon
		);
		const start = new google.maps.LatLng(
			this.userOrder.geoLocation.coordinates.lat,
			this.userOrder.geoLocation.coordinates.lng
		);
		const end = new google.maps.LatLng(
			this.storeLoc.geoLocation.coordinates.lat,
			this.storeLoc.geoLocation.coordinates.lng
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

		const warehouseInfoContent = `
									<h3>  ${this.storeLoc.name}</h3>
									<ul>
										<li>
											<i style='margin-right:5px;' class="ion-md-mail"></i>
											${this.storeLoc.contactEmail}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-phone"></i><i class="ion-md-call"></i>
											${this.storeLoc.contactPhone}
										</li>
										<li>
											<i style='margin-right:5px;' class="ion-md-locate"></i>
											${this.storeLoc.geoLocation.streetAddress}
										</li>
									</ul>
									`;

		const warehouseInfoWindow = new google.maps.InfoWindow({
			content: warehouseInfoContent,
		});

		this.warehouseMarker.addListener('click', () => {
			warehouseInfoWindow.open(this.map, this.warehouseMarker);
		});

		this.map.setCenter(newCoordinates);
		const carierIcon =
			'http://maps.google.com/mapfiles/kml/pal4/icon54.png';

		this.marker = this.addMarker(newCoordinates, this.map, carierIcon);
		const carrierInfoContent = `
					<h3>  ${this.carrierLoc.fullName}</h3>
					<ul>
						<li>${this.carrierLoc.username}</li>
						<li><i style='margin-right:5px;' class="ion-md-call"></i>${this.carrierLoc.phone}</li>
						<li><i style='margin-right:5px;' class="ion-md-locate"></i>${this.carrierLoc.geoLocation.streetAddress}</li>
					</ul>
					`;

		const carrierInfoWindow = new google.maps.InfoWindow({
			content: carrierInfoContent,
		});

		this.marker.addListener('click', () => {
			carrierInfoWindow.open(this.map, this.marker);
		});
	}

	revertMap() {
		this.map.setZoom(15);
		this.warehouseMarker.setMap(null);
		this.userMarker.setMap(null);
	}

	showMap() {
		const mapProp = {
			center: new google.maps.LatLng(42.642941, 23.334149),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		};
		this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	}

	addMarker(position, map, icon) {
		return new google.maps.Marker({
			position,
			map,
			icon,
		});
	}
}
