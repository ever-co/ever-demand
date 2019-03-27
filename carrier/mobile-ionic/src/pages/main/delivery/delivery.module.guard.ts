import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'services/store.service';

@Injectable()
export class DeliveryModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		const orderId = await this.store.orderId;
		if (!orderId) {
			this.router.navigateByUrl('/main/home');
			return false;
		}
		const driveToWarehouseFrom = await this.store.driveToWarehouseFrom;
		if (driveToWarehouseFrom === 'delivery') {
			this.router.navigateByUrl('/main/drive-to-warehouse');
			return false;
		}
		return true;
	}
}
