import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IUserOrdersRouter from '@modules/server.common/routers/IUserOrdersRouter';
import IOrder from '@modules/server.common/interfaces/IOrder';
import Order from '@modules/server.common/entities/Order';
import IOrderProductInfo from '@modules/server.common/interfaces/IOrderProductInfo';
import _ from 'lodash';

@Injectable()
export class UserOrdersRouter implements IUserOrdersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('user-orders');
	}

	get(userId: string): Observable<Order[]> {
		return this.router
			.runAndObserve<IOrder[]>('get', userId)
			.pipe(
				map((orders) =>
					_.map(orders, (order) => this._orderFactory(order))
				)
			);
	}

	getOrderedProducts(userId: string): Observable<IOrderProductInfo[]> {
		return this.router.runAndObserve<IOrderProductInfo[]>(
			'getOrderedProducts',
			userId
		);
	}

	protected _orderFactory(order: IOrder) {
		return order == null ? null : new Order(order);
	}
}
