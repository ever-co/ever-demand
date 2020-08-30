import { Injectable } from '@angular/core';
import {
	CanLoad,
	Route,
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Store } from 'app/services/store';

@Injectable()
export class SocieModuleGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const id = route.params['id'];
		if (id) {
			this.store.userId = id;
			this.router.navigate(['products']);
			return false;
		}
		return true;
	}
}
