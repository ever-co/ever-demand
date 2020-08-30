import { Injectable } from '@angular/core';
import { CanLoad, Route, Router } from '@angular/router';
import { Store } from '../../services/store.service';

@Injectable()
export class LoginModuleGuard implements CanLoad {
	constructor(
		private readonly store: Store,
		private readonly router: Router
	) {}

	async canLoad(route: Route) {
		return true;
	}
}
