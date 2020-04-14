import { Injectable } from '@angular/core';
import { Router, CanLoad } from '@angular/router';
import { Store } from 'services/store.service';

@Injectable()
export class MaintenanceModuleGuard implements CanLoad {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canLoad(): boolean {
		const maintenanceMode = this.store.maintenanceMode;
		if (!maintenanceMode) {
			this.router.navigateByUrl('info/server-down');
			return false;
		}

		return true;
	}
}
