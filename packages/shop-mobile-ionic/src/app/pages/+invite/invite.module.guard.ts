import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../services/store.service';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';

@Injectable()
export class InviteModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	canLoad(route: Route) {
		if (
			this.store.userId != null ||
			this.store.registrationSystem === RegistrationSystem.Disabled
		) {
			this.router.navigate(['products']);
			return false;
		}
		return true;
	}
}
