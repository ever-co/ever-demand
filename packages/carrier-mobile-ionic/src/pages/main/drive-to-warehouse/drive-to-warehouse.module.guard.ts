import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'services/store.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { first } from 'rxjs/operators';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';

@Injectable()
export class DriveToWarehouseModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router,
		private readonly orderRouter: OrderRouter
	) {}

	async canLoad(route: Route) {
		const orderId = await this.store.orderId;
		if (orderId) {
			const order = await this.orderRouter
				.get(orderId, {
					populateCarrier: false,
					populateWarehouse: false,
				})
				.pipe(first())
				.toPromise();

			const driveToWarehouseFrom = await this.store.driveToWarehouseFrom;

			if (driveToWarehouseFrom === 'delivery') {
				return true;
			}

			if (order.carrierStatus > OrderCarrierStatus.CarrierSelectedOrder) {
				this.router.navigateByUrl('/main/starting-delivery');
				return false;
			}
		} else {
			this.router.navigateByUrl('/main/home');
			return false;
		}
		return true;
	}
}
