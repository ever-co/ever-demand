import { Component, ViewChild } from '@angular/core';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import CarrierStatus from '@modules/server.common/enums/CarrierStatus';
import _ from 'lodash';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import { Store } from '../../../services/store.service';
import { GeoLocationOrdersService } from '../../../services/geo-location-order.service';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoLocationService } from '../../../services/geo-location.service';
import { MapComponent } from '../common/map/map.component';
import { Router } from '@angular/router';

declare var google: any;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
})
export class HomePage {
	@ViewChild('map')
	carrierMap: MapComponent;

	carrier: ICarrier;
	isWorking: boolean;
	carrier$;
	order$;
	marker;
	map: any;

	constructor(
		private carrierRouter: CarrierRouter,
		private localNotifications: LocalNotifications,
		private store: Store,
		private geoLocationOrdersService: GeoLocationOrdersService,
		private geolocation: Geolocation,
		private geoLocationService: GeoLocationService,
		private router: Router
	) {}

	ionViewWillEnter() {
		localStorage.removeItem('returnProductFrom');
		localStorage.removeItem('driveToWarehouseFrom');

		this.loadData();
	}

	ionViewWillLeave() {
		this.unsubscribeAll();
	}

	async startWorking() {
		const res = await this.carrierRouter.updateStatus(
			this.store.carrierId,
			CarrierStatus.Online
		);

		this.isWorking = res.status === CarrierStatus.Online;
	}

	async stopWorking() {
		const res = await this.carrierRouter.updateStatus(
			this.store.carrierId,
			CarrierStatus.Offline
		);

		this.isWorking = res.status === CarrierStatus.Online;
		localStorage.removeItem('orderId');
		this.store.selectedOrder = null;
	}

	notification() {
		this.localNotifications.schedule({
			id: 1,
			title: 'Attention',
			text: 'New order nearby you!',
			led: 'FFFF00',
			vibrate: true,
			wakeup: false,
		});
	}

	private async loadData() {
		this.carrier$ = this.carrierRouter
			.get(this.store.carrierId)

			.subscribe(async (carrier) => {
				this.isWorking = carrier.status === CarrierStatus.Online;
				this.carrier = carrier;
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

				this.carrierMap.addMarker(
					new google.maps.LatLng(
						position.coords.latitude,
						position.coords.longitude
					)
				);

				if (this.order$) {
					await this.order$.unsubscribe();
				}

				if (carrier.status === CarrierStatus.Online) {
					this.order$ = this.geoLocationOrdersService
						.getOrderForWork(
							dbGeoInput,
							carrier.skippedOrderIds,
							{ sort: 'asc' },
							{
								isCancelled: false,
							}
						)

						.subscribe(async (order) => {
							if (order || this.store.orderId) {
								if (this.marker) {
									this.marker.setMap(null);
								}
								this.notification();
								if (!this.store.orderId) {
									this.store.orderId = order.id;
								}

								this.unsubscribeAll();

								this.router.navigateByUrl(
									'/main/drive-to-warehouse',
									{ skipLocationChange: false }
								);
							}
						});

					// Old code here get all avaiable orders near carrier
					// this.order$ = this.geoLocationOrdersRouter
					// 	.get(carrier.geoLocation as GeoLocation)
					// 	.map((orders) => {
					// 		return _.find(orders, (order) => {
					// 			return (
					// 				order.warehouseStatus >=
					// 					OrderWarehouseStatus.PackagingFinished &&
					// 				order.status ===
					// 					OrderStatus.WarehousePreparation &&
					// 				!_.includes(
					// 					carrier.skippedOrderIds,
					// 					order.id
					// 				)
					// 			);
					// 		});
					// 	})
					// 	.filter((availableOrder) => availableOrder != null)
					// 	.take(1)
					// 	.subscribe((availableOrder) => {
					// 		if (this.marker) {
					// 			this.marker.setMap(null);
					// 		}
					// 		this.notification();
					// 		localStorage.setItem(
					// 			'orderId',
					// 			availableOrder.id
					// 		);
					// 		this.navCtrl.push('drive-to-warehouse', {
					// 			map: this.navParams.get('map')
					// 		});
					// 	});
				}

				this.carrierMap.setCenter(
					new google.maps.LatLng(
						position.coords.latitude,
						position.coords.longitude
					)
				);
			});
	}

	private unsubscribeAll() {
		if (this.carrier$) {
			this.carrier$.unsubscribe();
		}
		if (this.order$) {
			this.order$.unsubscribe();
		}
	}
}
