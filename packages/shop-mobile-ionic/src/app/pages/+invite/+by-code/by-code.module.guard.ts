import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../../services/store.service';

@Injectable()
export class ByCodeModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		if (!this.store.inviteSystem) {
			this.router.navigate(['invite/by-location']);
			return false;
		}
		return true;
	}
}
