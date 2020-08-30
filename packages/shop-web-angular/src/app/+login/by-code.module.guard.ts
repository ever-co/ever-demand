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
export class ByCodeModuleGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		if (!this.store.inviteSystem) {
			this.router.navigate(['login/byLocation']);
			return false;
		}
		return true;
	}
}
