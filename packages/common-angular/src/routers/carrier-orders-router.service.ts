import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import ICarrierOrdersRouter, {
	ICarrierOrdersRouterGetAvailableOptions,
	ICarrierOrdersRouterGetOptions,
} from '@modules/server.common/routers/ICarrierOrdersRouter';
import Order from '@modules/server.common/entities/Order';
import Carrier from '@modules/server.common/entities/Carrier';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import IOrder from '@modules/server.common/interfaces/IOrder';
import ICarrier from '@modules/server.common/interfaces/ICarrier';

@Injectable()
export class CarrierOrdersRouter implements ICarrierOrdersRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('carrier-orders');
	}

	get(
		id: string,
		options: ICarrierOrdersRouterGetOptions
	): Observable<Order[]> {
		return this.router
			.runAndObserve<IOrder[]>('get', id, options)
			.pipe(
				map((orders) =>
					_.map(orders, (order) => this._orderFactory(order))
				)
			);
	}

	getAvailable(
		id: string,
		options: ICarrierOrdersRouterGetAvailableOptions
	): Observable<Order[]> {
		return this.router
			.runAndObserve<IOrder[]>('getAvailable', id, options)
			.pipe(
				map((orders) =>
					_.map(orders, (order) => this._orderFactory(order))
				)
			);
	}

	async selectedForDelivery(
		carrierId: string,
		orderIds: string[]
	): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'selectedForDelivery',
			carrierId,
			orderIds
		);
		return this._carrierFactory(carrier);
	}

	async updateStatus(
		carrierId: string,
		newStatus: OrderCarrierStatus
	): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'updateStatus',
			carrierId,
			newStatus
		);
		return this._carrierFactory(carrier);
	}

	async cancelDelivery(
		carrierId: string,
		orderIds: string[]
	): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'cancelDelivery',
			carrierId,
			orderIds
		);
		return this._carrierFactory(carrier);
	}

	getCount(carrierId: string): Promise<number> {
		return this.router.run<number>('getCount', carrierId);
	}

	async skipOrders(carrierId: string, ordersIds: string[]): Promise<Carrier> {
		const carrier = await this.router.run<ICarrier>(
			'skipOrders',
			carrierId,
			ordersIds
		);
		return this._carrierFactory(carrier);
	}

	protected _carrierFactory(carrier: ICarrier) {
		return carrier == null ? null : new Carrier(carrier);
	}

	protected _orderFactory(order: IOrder) {
		return order == null ? null : new Order(order);
	}
}
