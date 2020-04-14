import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import _ from 'lodash';
import { OrdersService } from '../orders';
import Order from '@modules/server.common/entities/Order';
import { UsersService } from './UsersService';
import { createEverLogger } from '../../helpers/Log';
import IUserOrdersRouter from '@modules/server.common/routers/IUserOrdersRouter';
import { observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import { ExistenceEventType } from '@pyro/db-server';
import { concat, of, Observable } from 'rxjs';
import { exhaustMap, filter, share } from 'rxjs/operators';
import User from '@modules/server.common/entities/User';
import mongoose = require('mongoose');
import { ObjectId } from 'mongodb';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import Logger from 'bunyan';

/**
 * Customers Orders Service
 * TODO: rename Users to Customers
 *
 * @export
 * @class UsersOrdersService
 * @implements {IUserOrdersRouter}
 * @implements {IService}
 */
@injectable()
@routerName('user-orders')
export class UsersOrdersService implements IUserOrdersRouter, IService {
	protected readonly log: Logger = createEverLogger({
		name: 'usersOrdersService',
	});

	constructor(
		@inject(new LazyServiceIdentifer(() => OrdersService))
		protected ordersService: OrdersService,
		@inject(new LazyServiceIdentifer(() => UsersService))
		protected usersService: UsersService
	) {}

	/**
	 * Get Orders for given Customers
	 * TODO: add paging
	 *
	 * @param {User['id']} userId
	 * @returns {Observable<Order[]>}
	 * @memberof UsersOrdersService
	 */
	@observableListener()
	get(userId: User['id']): Observable<Order[]> {
		return concat(
			of(null),
			this.ordersService.existence.pipe(
				filter((e) => this._shouldPull(userId, e)),
				share()
			)
		).pipe(exhaustMap(() => this.getCurrent(userId)));
	}

	/**
	 * Get Orders for given Customers
	 * TODO: add paging
	 *
	 * @param {string} userId
	 * @returns {Promise<Order[]>}
	 * @memberof UsersOrdersService
	 */
	async getCurrent(userId: string): Promise<Order[]> {
		const orders = await this.ordersService.find({
			'user._id': new mongoose.Types.ObjectId(userId),
			isDeleted: { $eq: false },
		});

		return _.orderBy(
			orders,
			[(order) => order.createdAt, (order) => order.orderNumber],
			['desc', 'desc']
		);
	}

	async getCustomerMetrics(id: string) {
		const completedUserOrders = await this.ordersService.Model.find({
			$and: [
				{ 'user._id': id },
				{
					$or: [
						{ carrierStatus: OrderCarrierStatus.DeliveryCompleted },
						{
							warehouseStatus:
								OrderWarehouseStatus.GivenToCustomer,
						},
					],
				},
				{ isCancelled: false },
			],
		}).select({ products: 1 });

		const completedOrdersTotalSum = completedUserOrders
			.map((o) => {
				return o.products
					.map((p) => {
						return p.price * p.count;
					})
					.reduce((a, b) => a + b, 0);
			})
			.reduce((a, b) => a + b, 0);

		const totalOrders = await this.ordersService.Model.find({
			'user._id': id,
		})
			.countDocuments()
			.exec();

		const canceledOrders = await this.ordersService.Model.find({
			$and: [{ 'user._id': id }, { isCancelled: true }],
		})
			.countDocuments()
			.exec();

		return {
			totalOrders,
			canceledOrders,
			completedOrdersTotalSum,
		};
	}

	private _shouldPull(userId: User['id'], event) {
		switch (event.type as ExistenceEventType) {
			case ExistenceEventType.Created:
				return event.value != null && event.value.user.id === userId;

			case ExistenceEventType.Updated:
				return (
					(event.value != null && event.value.user.id === userId) ||
					(event.lastValue != null &&
						event.lastValue.user.id === userId)
				);

			case ExistenceEventType.Removed:
				return (
					event.lastValue != null &&
					event.lastValue.user.id === userId
				);
		}
	}
}
