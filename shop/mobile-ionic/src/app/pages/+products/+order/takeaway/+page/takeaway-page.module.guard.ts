import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'app/services/store.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Injectable()
export class OrderTakeawayInfoModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	canLoad(route: Route) {
		if (this.store.orderId === null) {
			this.router.navigate(['invite']);
		}
		if (this.store.deliveryType === DeliveryType.Delivery) {
			this.router.navigate(['order-info']);
			return false;
		}
		return true;
	}
}
