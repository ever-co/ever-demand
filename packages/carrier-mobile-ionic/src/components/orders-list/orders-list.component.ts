import { Component, OnInit, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GeoLocationOrdersService } from '../../services/geo-location-order.service';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { Store } from 'services/store.service';
import { GeoLocationService } from '../../services/geo-location.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { CarrierOrdersRouter } from '@modules/client.common.angular2/routers/carrier-orders-router.service';
import { Router } from '@angular/router';

@Component({
	selector: 'orders-list-modal',
	templateUrl: './orders-list.component.html',
	styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
	filteredList = [];
	private carrier;

	constructor(
		private modalCtrl: ModalController,
		private geoLocationOrdersService: GeoLocationOrdersService,
		private carrierRouter: CarrierRouter,
		private store: Store,
		private geolocation: Geolocation,
		private geoLocationService: GeoLocationService,
		private orderRouter: OrderRouter,
		private carrierOrdersRouter: CarrierOrdersRouter,

		private ngZone: NgZone,
		private router: Router
	) {}

	ngOnInit() {
		this.loadOrderslist();
	}

	filterOrdersList(orders) {
		this.filteredList = [].concat(orders).reverse();
	}

	async loadOrderslist() {
		this.carrierRouter
			.get(this.store.carrierId)
			.subscribe(async (carrier) => {
				this.carrier = carrier;
				const position = this.geoLocationService.defaultLocation()
					? this.geoLocationService.defaultLocation()
					: await this.geolocation.getCurrentPosition();

				let dbGeoInput = {
					loc: {
						type: 'Point',
						coordinates: [
							position.coords.longitude,
							position.coords.latitude,
						],
					},
				} as IGeoLocation;

				this.geoLocationOrdersService
					.getOrdersForWork(
						dbGeoInput,
						carrier.skippedOrderIds,
						{
							limit: 10,
						},
						{
							isCancelled: false,
						}
					)
					.subscribe((list) => {
						this.filterOrdersList(list);
					});
			});
	}
	async closeOrderListModal() {
		await this.modalCtrl.dismiss();
	}

	selectNewOrder(id) {
		this.store.orderId = id;

		this.closeOrderListModal();
		this.router.navigateByUrl('/', { skipLocationChange: false });
	}
}
