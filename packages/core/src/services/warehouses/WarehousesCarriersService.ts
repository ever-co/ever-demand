import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import Carrier from '@modules/server.common/entities/Carrier';
import { of, Observable } from 'rxjs';
import { CarriersService } from '../carriers';
import { WarehousesService } from './WarehousesService';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	catchError,
	distinctUntilChanged,
	exhaustMap,
	map,
	switchMap,
} from 'rxjs/operators';
import { routerName, observableListener, asyncListener } from '@pyro/io';
import * as _ from 'lodash';
import IWarehouseCarriersRouter from '@modules/server.common/routers/IWarehouseCarriersRouter';
import { env } from '../../env';
import { AuthService, AuthServiceFactory } from '../auth';

class NoWarehouseRestrictedCarriersError extends Error {
	constructor() {
		super("Warehouse doesn't have carriers restricted to himself");
	}
}

/**
 * Warehouses Carriers Service
 *
 * @export
 * @class WarehousesCarriersService
 * @implements {IWarehouseCarriersRouter}
 */
@injectable()
@routerName('warehouse-carriers')
export class WarehousesCarriersService implements IWarehouseCarriersRouter {
	private readonly authService: AuthService<Carrier>;

	constructor(
		@inject(new LazyServiceIdentifer(() => CarriersService))
		private readonly carriersService: CarriersService,
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		private readonly warehousesService: WarehousesService,
		@inject('Factory<AuthService>')
		private readonly authServiceFactory: AuthServiceFactory
	) {
		this.authService = this.authServiceFactory({
			role: 'carrier',
			Entity: Carrier,
			saltRounds: env.CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS,
		});
	}

	/**
	 * Get Carriers assigned to given Store
	 * Returns null if !warehouse.hasRestrictedCarriers
	 * @param {String} warehouseId
	 * @returns {Observable<Carrier[] | null>}
	 */
	@observableListener()
	get(warehouseId: Warehouse['id']): Observable<Carrier[] | null> {
		return this.warehousesService.get(warehouseId).pipe(
			map((warehouse) => {
				if (!warehouse.hasRestrictedCarriers) {
					throw new NoWarehouseRestrictedCarriersError();
				}

				return warehouse.usedCarriersIds;
			}),
			distinctUntilChanged((carrierIds1, carrierIds2) => {
				return _.isEqual(carrierIds1.sort(), carrierIds2.sort());
			}),
			exhaustMap((carrierIds) => {
				return this.carriersService.getMultipleByIds(carrierIds);
			}),
			switchMap((carriers) => carriers),
			catchError((err) => {
				if (!(err instanceof NoWarehouseRestrictedCarriersError)) {
					throw err;
				}

				return of(null);
			})
		);
	}

	/**
	 * Update the password of a carrier the calling merchant uses.
	 * Refused unless `token` is a valid merchant ('warehouse') login token
	 * and the carrier is in that merchant's usedCarriersIds.
	 *
	 * @param {Carrier['id']} id
	 * @param {String} password
	 * @param {String} token - the merchant's login token
	 * @returns {Promise<void>}
	 * @memberof WarehousesCarriersService
	 */
	@asyncListener()
	async updatePassword(
		id: Carrier['id'],
		password: string,
		token: string
	): Promise<void> {
		const warehouseId = this.authService.getVerifiedId(token, 'warehouse');

		if (warehouseId == null) {
			throw new Error('Not authorized to update the carrier password');
		}

		const warehouse = await this.warehousesService.getCurrent(warehouseId);

		if (
			warehouse == null ||
			warehouse.isDeleted ||
			!_.includes(warehouse.usedCarriersIds, id)
		) {
			throw new Error('Not authorized to update the carrier password');
		}

		await this.carriersService.throwIfNotExists(id);
		await this.authService._savePassword(id, password);
	}
}
