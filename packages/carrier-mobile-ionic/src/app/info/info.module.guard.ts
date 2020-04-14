import { Injectable } from '@angular/core';
import { Router, CanLoad, Route } from '@angular/router';
import { Store } from 'services/store.service';

@Injectable()
export class InfoModuleGuard implements CanLoad {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canLoad(route: Route): boolean {
		const showInformationPage = this.store.showInformationPage;
		if (!showInformationPage) {
			this.router.navigateByUrl('');
			return false;
		}

		return true;
	}
}
