import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { Store } from 'services/store.service';

@Injectable()
export class PagesModuleGuard implements CanLoad {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	async canLoad(route: Route) {
		const showInformationPage = this.store.showInformationPage;

		if (showInformationPage) {
			await this.router.navigateByUrl('/info');
			return false;
		}

		return true;
	}
}
