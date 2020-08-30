import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from 'services/store.service';

@Injectable()
export class HomeModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		const orderId = await this.store.orderId;
		if (orderId) {
			this.router.navigateByUrl('/main/drive-to-warehouse');
			return false;
		}
		return true;
	}
}
