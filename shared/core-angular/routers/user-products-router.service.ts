import { Observable } from 'rxjs';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IUserProductsRouter from '@modules/server.common/routers/IUserProductsRouter';

@Injectable()
export class UserProductsRouter implements IUserProductsRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('user-products');
	}

	getPlaceholder(userId: string, deviceId: string): Observable<string> {
		return this.router.runAndObserve<string>(
			'getPlaceholder',
			userId,
			deviceId
		);
	}
}
