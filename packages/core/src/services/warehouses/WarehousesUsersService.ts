import Logger from 'bunyan';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { createEverLogger } from '../../helpers/Log';
import { observableListener, routerName, asyncListener } from '@pyro/io';
import IService from '../IService';
import { concat, Observable } from 'rxjs';
import User from '@modules/server.common/entities/User';
import { OrdersService } from '../orders';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { WarehousesOrdersService } from './WarehousesOrdersService';
import { exhaustMap, map, switchMap, tap, first } from 'rxjs/operators';
import IWarehouseUsersRouter from '@modules/server.common/routers/IWarehouseUsersRouter';
import { WarehousesService } from './WarehousesService';

/**
 * Warehouses Customers Service
 *
 * @export
 * @class WarehousesUsersService
 * @implements {IService}
 * @implements {IWarehouseUsersRouter}
 */
@injectable()
@routerName('warehouse-users')
export class WarehousesUsersService implements IService, IWarehouseUsersRouter {
	protected log: Logger = createEverLogger({
		name: 'warehousesUsersService',
	});

	constructor(
		@inject(new LazyServiceIdentifer(() => WarehousesOrdersService))
		private readonly warehousesOrdersService: WarehousesOrdersService,
		@inject(new LazyServiceIdentifer(() => OrdersService))
		private readonly ordersService: OrdersService,
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		private readonly _warehousesService: WarehousesService
	) {}

	/**
	 * Returns the customers who made orders from the given Store
	 * @param {String} warehouseId
	 * @returns {Observable<User[]>}
	 */
	@observableListener()
	get(warehouseId: Warehouse['id']): Observable<User[]> {
		return concat(
			null,
			this.warehousesOrdersService.getExistence(warehouseId)
		).pipe(
			exhaustMap(() => {
				return this.ordersService.Model.distinct('user._id', {
					warehouse: warehouseId,
					isDeleted: { $eq: false },
				})
					.lean()
					.exec();
			}),
			map((users: User[]) => {
				return users.map((u) => new User(u));
			})
		);
	}

	/**
	 * Returns the customers who made orders from from the given Store
	 *
	 * @param {Warehouse['id']} warehouseId
	 * @returns {Promise<User[]>}
	 * @memberof WarehousesUsersService
	 */
	@asyncListener()
	async getPromise(warehouseId: Warehouse['id']): Promise<User[]> {
		await this._warehousesService.throwIfNotExists(warehouseId);
		return this.get(warehouseId).pipe(first()).toPromise();
	}
}
