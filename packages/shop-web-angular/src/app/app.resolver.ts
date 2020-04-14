import {
	Resolve,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class DataResolver implements Resolve<any> {
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return of({ res: 'I am data' });
	}
}

export const APP_RESOLVER_PROVIDERS = [DataResolver];
