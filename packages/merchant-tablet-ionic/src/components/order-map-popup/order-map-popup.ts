import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';

import Order from '@modules/server.common/entities/Order';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { first } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import {
	LoadingController,
	ActionSheetController,
	ModalController,
} from '@ionic/angular';

declare var google: any;

@Component({
	selector: 'order-map-popup',
	templateUrl: 'order-map-popup.html',
	styleUrls: ['./order-map-popup.scss'],
})
export class OrderMapPopupPage implements OnInit {
	@ViewChild('gmap', { static: true })
	gmapElement: ElementRef;

	@Input()
	order: Order;

	map: google.maps.Map;
	myLatLng = { lat: 0, lng: 0 };

	warehouse: Warehouse;

	marker: any;
	userMarker: any;
	warehouseMarker: any;

	merchantIcon = environment.MAP_MERCHANT_ICON_LINK;
	userIcon = environment.MAP_USER_ICON_LINK;
	carrierIcon = environment.MAP_CARRIER_ICON_LINK;

	constructor(
		public loadingCtrl: LoadingController,
		public actionSheetCtrl: ActionSheetController,
		public warehouseRouter: WarehouseRouter,
		public modalController: ModalController
	) {}

	ngOnInit(): void {
		if (this.order) {
			this.loadWarehouse();
		}
		this.showMap();
	}

	loadMap() {
		if (this.order && this.warehouse) {
			const user = this.order.user;
			const warehouse = this.warehouse;
			const carrier = this.order.carrier;
			const warehouseIcon = this.merchantIcon;
			const userIcon = this.userIcon;

			const carierIcon = this.carrierIcon;

			const [cLng, cLat] = carrier['geoLocation'].loc.coordinates;
			this.marker = this.addMarker(
				new google.maps.LatLng(cLat, cLng),
				this.map,
				carierIcon
			);

			const [uLng, uLat] = user.geoLocation.loc.coordinates;
			this.userMarker = this.addMarker(
				new google.maps.LatLng(uLat, uLng),
				this.map,
				userIcon
			);

			const [wLng, wLat] = warehouse['geoLocation'].loc.coordinates;
			this.warehouseMarker = this.addMarker(
				new google.maps.LatLng(wLat, wLng),
				this.map,
				warehouseIcon
			);

			const bounds = new google.maps.LatLngBounds();
			bounds.extend(this.marker.getPosition());
			bounds.extend(this.warehouseMarker.getPosition());
			bounds.extend(this.userMarker.getPosition());
			this.map.fitBounds(bounds);
		}
	}

	cancelModal() {
		this.modalController.dismiss();
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

	getfullAddress(geoLocation) {
		return (
			`${geoLocation.city}, ${geoLocation.streetAddress} ` +
			`${geoLocation.house}`
		);
	}

	private async loadWarehouse() {
		this.warehouse = await this.warehouseRouter
			.get(this.order.warehouseId, false)
			.pipe(first())
			.toPromise();

		this.loadMap();
	}
}
