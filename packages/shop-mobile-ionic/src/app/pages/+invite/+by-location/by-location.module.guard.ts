import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../../services/store.service';

@Injectable()
export class ByLocationModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		if (this.store.inviteRequestId != null && this.store.inviteSystem) {
			this.router.navigate(['invite/by-code']);
			return false;
		}
		return true;
	}
}
