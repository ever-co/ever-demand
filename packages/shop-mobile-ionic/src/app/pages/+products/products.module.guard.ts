import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../services/store.service';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';

@Injectable()
export class ProductsModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		const isLogged = await this.store.isLogged();

		if (
			!isLogged &&
			this.store.registrationSystem === RegistrationSystem.Enabled
		) {
			this.router.navigate(['invite']);
			return false;
		}

		return true;
	}
}
