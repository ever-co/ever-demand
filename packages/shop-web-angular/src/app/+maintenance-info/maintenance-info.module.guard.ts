import { Injectable } from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Store } from 'app/services/store';

@Injectable()
export class MaintenanceModuleGuard implements CanActivate {
	constructor(private readonly router: Router, private store: Store) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const maintenanceMode = this.store.maintenanceMode;
		if (!maintenanceMode) {
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
