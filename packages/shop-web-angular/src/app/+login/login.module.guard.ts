import { Injectable } from '@angular/core';
import {
	Router,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Store } from 'app/services/store';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';

@Injectable()
export class LoginModuleGuard implements CanActivate {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const id = route.firstChild['params'].id;
		if (
			this.store.userId != null ||
			(this.store.registrationSystem === RegistrationSystem.Disabled &&
				!id)
		) {
			this.router.navigate(['products']);
			return false;
		}
		return true;
	}
}
