import { Router, CanLoad } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from 'services/store.service';

@Injectable()
export class ServerDownModuleGuard implements CanLoad {
	constructor(
		private readonly router: Router,
		private readonly store: Store
	) {}

	canLoad(): boolean {
		const serverDown = Number(this.store.serverConnection) === 0;
		if (!serverDown) {
			this.router.navigate(['']);
			return false;
		}
		return true;
	}
}
