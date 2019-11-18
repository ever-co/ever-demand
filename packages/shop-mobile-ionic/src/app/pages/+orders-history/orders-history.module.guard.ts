import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../services/store.service';

@Injectable()
export class OrdersHistoryModuleGuard implements CanLoad {
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

		return true;
	}
}
