import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterFactory } from '../lib/router';
import IOrderRouter, {
	IOrderRouterGetOptions,
} from '@modules/server.common/routers/IOrderRouter';
import Order from '@modules/server.common/entities/Order';
import Warehouse from '@modules/server.common/entities/Warehouse';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import IOrder from '@modules/server.common/interfaces/IOrder';

@Injectable()
export class OrderRouter implements IOrderRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('order');
	}

	get(id: string, options?: IOrderRouterGetOptions): Observable<Order> {
		return this.router
			.runAndObserve<IOrder>('get', id, options)
			.pipe(map((order) => this._orderFactory(order)));
	}

	async confirm(orderId: string): Promise<Order> {
		const order = await this.router.run<IOrder>('confirm', orderId);
		return this._orderFactory(order);
	}

	async complete(orderId: string): Promise<Order> {
		const order = await this.router.run<IOrder>('complete', orderId);
		return this._orderFactory(order);
	}

	async updateCarrierStatus(
		orderId: string,
		status: OrderCarrierStatus
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'updateCarrierStatus',
			orderId,
			status
		);
		return this._orderFactory(order);
	}

	async updateWarehouseStatus(
		orderId: string,
		status: OrderWarehouseStatus
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'updateWarehouseStatus',
			orderId,
			status
		);
		return this._orderFactory(order);
	}

	async payWithStripe(orderId: string, cardId: string): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'payWithStripe',
			orderId,
			cardId
		);
		return this._orderFactory(order);
	}

	async refundWithStripe(orderId: string): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'refundWithStripe',
			orderId
		);
		return this._orderFactory(order);
	}

	async addProducts(
		orderId: Order['id'],
		products,
		warehouseId: Warehouse['id']
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'addProducts',
			orderId,
			products,
			warehouseId
		);
		return this._orderFactory(order);
	}

	async decreaseOrderProducts(
		orderId: Order['id'],
		products,
		warehouseId: Warehouse['id']
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'decreaseOrderProducts',
			orderId,
			products,
			warehouseId
		);
		return this._orderFactory(order);
	}

	async removeProducts(
		orderId: Order['id'],
		productsIds: string[]
	): Promise<Order> {
		const order = await this.router.run<IOrder>(
			'removeProducts',
			orderId,
			productsIds
		);
		return this._orderFactory(order);
	}

	protected _orderFactory(order: IOrder) {
		return order == null ? null : new Order(order);
	}
}
