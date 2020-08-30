import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from '@angular/router';
import { Store } from '../../services/store.service';

@Injectable()
export class ProductsPageGuard implements CanActivate {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if (this.store.orderId != null && state.url === '/products') {
			this.router.navigate(['products', 'order']);
		}

		return true;
	}
}
