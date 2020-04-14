import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../../services/store.service';

@Injectable()
export class OrderModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	canLoad(route: Route) {
		if (this.store.orderId == null) {
			this.router.navigate(['products']);
		}
		return true;
	}
}
