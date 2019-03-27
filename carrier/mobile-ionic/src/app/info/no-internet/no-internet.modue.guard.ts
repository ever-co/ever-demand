import { Router, CanLoad } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from 'services/store.service';

@Injectable()
export class NoInternetModuleGuard implements CanLoad {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canLoad(): boolean {
		if (!this.store.noInternet) {
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
