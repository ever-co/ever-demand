import { Component, ViewChild, OnInit } from '@angular/core';

import IOrder from '@modules/server.common/interfaces/IOrder';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import Utils from '@modules/server.common/utils';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { Store } from '../../../services/store.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { GeoLocationService } from '../../../services/geo-location.service';
import { MapComponent } from '../common/map/map.component';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

declare var google: any;

@Component({
	selector: 'page-drive-to-warehouse',
	templateUrl: 'drive-to-warehouse.html',
})
export class DriveToWarehousePage implements OnInit {
	@ViewChild('map')
	carrierMap: MapComponent;

	selectedOrder: IOrder;
	carrier: ICarrier;
	carrierUserDistance: string;
	workTaken: boolean;
	fromDelivery: boolean;

	carrier$;
	order$;

	constructor(
		private orderRouter: OrderRouter,
		private carrierRouter: CarrierRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,
		private store: Store,
		private geoLocationService: GeoLocationService,
		private geolocation: Geolocation,
		private router: Router,
		private navCtrl: NavController
	) {}

	ngOnInit(): void {
		this.fromDelivery = this.store.driveToWarehouseFrom === 'delivery';
	}

	ionViewWillEnter() {
		this.carrier$ = this.carrierRouter
			.get(this.store.carrierId)
			.subscribe(async (c) => {
				this.carrier = c;

				const position = this.geoLocationService.defaultLocation()
					? this.geoLocationService.defaultLocation()
					: await this.geolocation.getCurrentPosition();

				// MongoDb store coordinates lng => lat
				let dbGeoInput = {
					loc: {
						type: 'Point',
						coordinates: [
							position.coords.longitude,
							position.coords.latitude,
						],
					},
				} as IGeoLocation;

				if (this.order$) {
					await this.order$.unsubscribe();
				}

				const orderId = localStorage.getItem('orderId');
				if (orderId) {
					this.order$ = this.orderRouter
						.get(orderId, {
							populateWarehouse: true,
						})
						.subscribe((order) => {
							this.selectedOrder = order;
							this.store.selectedOrder = order;
							this.workTaken =
								order.carrierStatus !==
								OrderCarrierStatus.NoCarrier;

							const origin = new google.maps.LatLng(
								position.coords.latitude,
								position.coords.longitude
							);

							const merchantGeo = order.warehouse['geoLocation'];

							this.carrierUserDistance = Utils.getDistance(
								merchantGeo,
								dbGeoInput as GeoLocation
							).toFixed(2);

							const destination = new google.maps.LatLng(
								merchantGeo.loc.coordinates[1],
								merchantGeo.loc.coordinates[0]
							);

							this.carrierMap.setCenter(origin);
							this.carrierMap.drawRoute(origin, destination);
						});
				}
			});
	}

	async takeWork() {
		if (this.carrier && this.selectedOrder) {
			return await this.carrierOrdersRouter.selectedForDelivery(
				this.carrier['id'],
				[this.selectedOrder['id']]
			);
		} else {
			// TODO: replace with some popup
			alert('Try again!');
		}
	}

	async skipWork() {
		if (this.carrier && this.selectedOrder) {
			await this.carrierOrdersRouter.skipOrders(this.carrier['id'], [
				this.selectedOrder['id'],
			]);

			this.unselectOrder();
		}
	}

	async carrierInWarehouse() {
		if (this.fromDelivery) {
			this.store.returnProductFrom = 'driveToWarehouse';

			this.router.navigate(['/product/return'], {
				skipLocationChange: false,
			});
		} else {
			this.router.navigateByUrl('/product/get', {
				skipLocationChange: false,
			});
		}

		this.unselectDriveToWarehouseFrom();
		this.unsubscribeAll();
	}

	async cancelWork() {
		if (this.fromDelivery) {
			this.unselectDriveToWarehouseFrom();
			this.router.navigateByUrl('/main/delivery', {
				skipLocationChange: true,
			});
		} else {
			if (this.carrier && this.selectedOrder) {
				await this.carrierOrdersRouter.cancelDelivery(
					this.carrier['id'],
					[this.selectedOrder['id']]
				);
				this.unselectOrder();
			}
		}
	}

	ionViewWillLeave() {
		this.unselectDriveToWarehouseFrom();
		this.unsubscribeAll();
	}

	unselectOrder() {
		this.store.selectedOrder = null;
		localStorage.removeItem('orderId');
		this.navCtrl.navigateRoot('/main/home');
	}

	private unsubscribeAll() {
		if (this.carrier$) {
			this.carrier$.unsubscribe();
		}
		if (this.order$) {
			this.order$.unsubscribe();
		}
	}

	private unselectDriveToWarehouseFrom() {
		localStorage.removeItem('driveToWarehouseFrom');
	}
}
