import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'services/store.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { first } from 'rxjs/operators';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';

@Injectable()
export class StartingDeliveryModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router,
		private readonly orderRouter: OrderRouter
	) {}

	async canLoad(route: Route) {
		const orderId = await this.store.orderId;
		if (!orderId) {
			this.router.navigateByUrl('/main/home');
			return false;
		} else {
			const order = await this.orderRouter
				.get(orderId, {
					populateCarrier: false,
					populateWarehouse: false,
				})
				.pipe(first())
				.toPromise();

			if (order.carrierStatus > OrderCarrierStatus.CarrierPickedUpOrder) {
				this.router.navigateByUrl('/main/delivery');
				return false;
			}
		}
		return true;
	}
}
