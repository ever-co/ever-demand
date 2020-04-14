import { map } from 'rxjs/operators';
import { Router, RouterFactory } from '../lib/router';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import IGeoLocationOrdersRouter, {
	IGeoLocationOrdersRouterGetOptions,
} from '@modules/server.common/routers/IGeoLocationOrdersRouter';
import IOrder from '@modules/server.common/interfaces/IOrder';
import Order from '@modules/server.common/entities/Order';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Injectable()
export class GeoLocationOrdersRouter implements IGeoLocationOrdersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('geo-location-orders');
	}

	get(
		geoLocation: GeoLocation,
		options: IGeoLocationOrdersRouterGetOptions = {}
	): Observable<Order[]> {
		return this.router
			.runAndObserve<IOrder[]>('get', geoLocation, options)
			.pipe(
				map((orders) =>
					_.map(orders, (order) => this._orderFactory(order))
				)
			);
	}

	protected _orderFactory(order: IOrder) {
		return order == null ? null : new Order(order);
	}
}
