import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../services/store.service';

@Injectable()
export class InfoModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	canLoad(route: Route) {
		if (!this.store.userId || !this.store.deviceId) {
			this.router.navigate(['invite']);
			return false;
		}

		return true;
	}
}
