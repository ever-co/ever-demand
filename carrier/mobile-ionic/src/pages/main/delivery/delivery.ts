import { Component, ViewChild, AfterViewInit } from '@angular/core';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import Utils from '@modules/server.common/utils';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { GeoLocationService } from '../../../services/geo-location.service';
import { MapComponent } from '../common/map/map.component';
import { Router } from '@angular/router';
import { Store } from 'services/store.service';
import { first } from 'rxjs/operators';

declare var google: any;

@Component({
	selector: 'page-delivery',
	templateUrl: 'delivery.html'
})
export class DeliveryPage implements AfterViewInit {
	@ViewChild('map', { static: false })
	carrierMap: MapComponent;

	selectedOrder: IOrder;
	carrierUserDistance: string;
	disabledButtons: boolean = true;

	get fullAddress() {
		return this.selectedOrder.user.fullAddress;
	}

	constructor(
		private orderRouter: OrderRouter,
		private mixpanel: Mixpanel,
		private geoLocationService: GeoLocationService,
		private geolocation: Geolocation,
		private router: Router,
		private store: Store
	) {}

	async delivered() {
		this.disabledButtons = true;
		if (this.selectedOrder) {
			this.router.navigateByUrl('/main/home', {
				skipLocationChange: false
			});

			this.unselectOrder();

			await this.orderRouter.updateCarrierStatus(
				this.selectedOrder['id'],
				OrderCarrierStatus.DeliveryCompleted
			);

			this.mixpanel.track('Order Delivered');
		} else {
			alert('Try again!');
		}
		this.disabledButtons = false;
	}

	cancel() {
		this.disabledButtons = true;
		this.store.driveToWarehouseFrom = 'delivery';
		this.router.navigateByUrl('/main/drive-to-warehouse', {
			skipLocationChange: false
		});
	}

	ngAfterViewInit(): void {
		this.loadData();
	}

	ionViewWillEnter() {}

	ionViewWillLeave() {}

	private unselectOrder() {
		localStorage.removeItem('orderId');
	}

	private async loadData() {
		const order = await this.orderRouter
			.get(localStorage.getItem('orderId'), { populateWarehouse: true })
			.pipe(first())
			.toPromise();

		this.selectedOrder = order;
		// const carrier = await this.carrierRouter
		// 	.get(order.carrierId)
		// 	.pipe(first())
		// 	.toPromise();

		const position = this.geoLocationService.defaultLocation()
			? this.geoLocationService.defaultLocation()
			: await this.geolocation.getCurrentPosition();

		// MongoDb store coordinates lng => lat
		const dbGeoInput = {
			loc: {
				type: 'Point',
				coordinates: [
					position.coords.longitude,
					position.coords.latitude
				]
			}
		} as IGeoLocation;

		const origin = new google.maps.LatLng(
			position.coords.latitude,
			position.coords.longitude
		);
		const userGeo = order.user['geoLocation'];

		this.carrierUserDistance = Utils.getDistance(
			userGeo,
			dbGeoInput as GeoLocation
		).toFixed(2);

		const destination = new google.maps.LatLng(
			userGeo.loc.coordinates[1],
			userGeo.loc.coordinates[0]
		);

		this.carrierMap.setCenter(origin);
		this.carrierMap.drawRoute(origin, destination);
		this.disabledButtons = false;
	}
}
