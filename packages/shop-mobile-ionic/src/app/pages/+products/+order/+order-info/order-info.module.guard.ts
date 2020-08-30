import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'app/services/store.service';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Injectable()
export class OrderInfoPageModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		const isLogged = await this.store.isLogged();

		if (!isLogged) {
			this.router.navigate(['invite']);
			return false;
		}

		if (this.store.deliveryType === DeliveryType.Takeaway) {
			this.router.navigate(['order-info-takeaway']);
			return false;
		}

		return true;
	}
}
