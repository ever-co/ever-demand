import { Injectable } from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Store } from 'app/services/store.service';

@Injectable()
export class PagesModuleGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const maintenanceMode = this.store.maintenanceMode;
		if (maintenanceMode) {
			this.router.navigate(['maintenance-info']);
			return false;
		}
		const serverConnection = Number(this.store.serverConnection);
		if (serverConnection === 0) {
			this.router.navigate(['server-down']);
			return false;
		}
		return true;
	}
}
