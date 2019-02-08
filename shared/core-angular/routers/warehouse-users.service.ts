import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterFactory } from '../lib/router';
import IWarehouseUsersRouter from '@modules/server.common/routers/IWarehouseUsersRouter';
import User from '@modules/server.common/entities/User';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Injectable()
export class WarehouseUsersService implements IWarehouseUsersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('warehouse-users');
	}

	get(warehouseId: Warehouse['id']): Observable<User[]> {
		return this.router.runAndObserve('get', warehouseId);
	}
}
