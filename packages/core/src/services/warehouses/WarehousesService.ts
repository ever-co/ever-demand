import Logger from 'bunyan';
import _ from 'lodash';
import { inject, injectable } from 'inversify';
import { ProductsService } from '../products';
import { createEverLogger } from '../../helpers/Log';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { default as IWarehouse } from '@modules/server.common/interfaces/IWarehouse';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { Observable } from 'rxjs';
import IWarehouseRouter, {
	IWarehouseRegistrationInput,
} from '@modules/server.common/routers/IWarehouseRouter';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization,
} from '@pyro/io';
import IService from '../IService';
import { concat, exhaustMap, tap, first, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { DBService } from '@pyro/db-server';
import { IWarehouseLoginResponse } from '@modules/server.common/routers/IWarehouseRouter';
import { env } from '../../env';
import { AuthService, AuthServiceFactory } from '../auth';
import { v1 as uuid } from 'uuid';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

/**
 * Warehouses Service
 *
 * @export
 * @class WarehousesService
 * @extends {DBService<Warehouse>}
 * @implements {IWarehouseRouter}
 * @implements {IService}
 */
@injectable()
@routerName('warehouse')
export class WarehousesService extends DBService<Warehouse>
	implements IWarehouseRouter, IService {
	public readonly DBObject: any = Warehouse;

	protected log: Logger = createEverLogger({ name: 'warehousesService' });

	private readonly authService: AuthService<Warehouse>;

	constructor(
		@inject(ProductsService)
		private readonly productsService: ProductsService,
		@inject('Factory<AuthService>')
		private readonly authServiceFactory: AuthServiceFactory
	) {
		super();
		this.authService = this.authServiceFactory({
			role: 'warehouse',
			Entity: Warehouse,
			saltRounds: env.USER_PASSWORD_BCRYPT_SALT_ROUNDS,
		});
	}

	/**
	 * Get Merchants
	 *
	 * @param {*} findInput
	 * @param {IPagingOptions} pagingOptions
	 * @returns
	 * @memberof WarehousesService
	 */
	async getMerchants(findInput: any, pagingOptions: IPagingOptions) {
		const sortObj = {};
		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.Model.find({
			...findInput,
			isDeleted: { $eq: false },
		})
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}

	/**
	 * Get all active merchants
	 *
	 * @param {boolean} [fullProducts=false]
	 * @returns {Observable<Warehouse[]>}
	 * @memberof WarehousesService
	 */
	@observableListener()
	getAllActive(fullProducts: boolean = false): Observable<Warehouse[]> {
		const callId = uuid();

		this.log.info(
			{ callId, fullProducts },
			'.getAllActive(fullProducts) called'
		);

		return of(null).pipe(
			concat(this.existence),
			exhaustMap(() => this._getAllCurrentActive(fullProducts)),
			tap({
				next: (warehouses) => {
					this.log.info(
						{ callId, fullProducts, warehouses },
						'.getAllActive(fullProducts) emitted next value'
					);
				},
				error: (err) => {
					this.log.error(
						{ callId, fullProducts, err },
						'.getAllActive(fullProducts) thrown error!'
					);
				},
			})
		);
	}

	/**
	 * Create new Merchant
	 *
	 * @param {IWarehouseRegistrationInput} input
	 * @returns
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async register(input: IWarehouseRegistrationInput) {
		const warehouse = await super.create({
			...input.warehouse,
			...(input.password
				? {
						hash: await this.authService.getPasswordHash(
							input.password
						),
				  }
				: {}),
		});
		return warehouse;
	}

	/**
	 * Update password for Merchant admin user
	 *
	 * @param {Warehouse['id']} id
	 * @param {{ current: string; new: string }} password
	 * @returns {Promise<void>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async updatePassword(
		id: Warehouse['id'],
		password: { current: string; new: string }
	): Promise<void> {
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}

	/**
	 * Authenticate user in the Merchant app
	 * TODO: move to separate Auth service
	 *
	 * @param {string} username
	 * @param {string} password
	 * @returns {(Promise<IWarehouseLoginResponse | null>)}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async login(
		username: string,
		password: string
	): Promise<IWarehouseLoginResponse | null> {
		const res = await this.authService.login({ username }, password);

		if (!res || res.entity.isDeleted) {
			return null;
		}

		return {
			warehouse: res.entity,
			token: res.token,
		};
	}

	/**
	 * Get Merchant
	 *
	 * @param {string} id
	 * @param {boolean} [fullProducts=true]
	 * @returns {(Observable<Warehouse | null>)}
	 * @memberof WarehousesService
	 */
	@observableListener()
	get(id: string, fullProducts = true): Observable<Warehouse | null> {
		if (!fullProducts) {
			return super.get(id).pipe(
				map(async (warehouse) => {
					await this.throwIfNotExists(id);
					return warehouse;
				}),
				switchMap((warehouse) => warehouse)
			);
		} else {
			return super
				.get(id)
				.pipe(
					map(async (warehouse) => {
						await this.throwIfNotExists(id);
						return warehouse;
					}),
					switchMap((warehouse) => warehouse)
				)
				.pipe(exhaustMap(() => this._get(id, true)));
		}
	}

	/**
	 * Set new location for existed warehouse
	 * Note: we support moving merchants. For example, some people/companies sell products on the "go".
	 * In such case, this method will be called periodically to update Merchant location in real-time
	 *
	 * @param {string} warehouseId
	 * @param {IGeoLocationCreateObject} geoLocation
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async updateGeoLocation(
		warehouseId: string,
		geoLocation: IGeoLocationCreateObject
	): Promise<Warehouse> {
		await this.throwIfNotExists(warehouseId);
		return this.update(warehouseId, { geoLocation });
	}

	/**
	 * Set warehouse to available or not available
	 * (e.g. warehouse close or open etc)
	 *
	 * @param {string} warehouseId
	 * @param {boolean} isAvailable
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async updateAvailability(
		warehouseId: string,
		isAvailable: boolean
	): Promise<Warehouse> {
		await this.throwIfNotExists(warehouseId);
		return this.update(warehouseId, { isActive: isAvailable });
	}

	/**
	 * Update Merchant details
	 *
	 * @param {Warehouse} warehouse
	 * @returns {Promise<Warehouse>}
	 * @memberof WarehousesService
	 */
	@asyncListener()
	async save(
		@serialization((w: IWarehouse) => new Warehouse(w)) warehouse: Warehouse
	): Promise<Warehouse> {
		await this.throwIfNotExists(warehouse.id);

		warehouse = _.clone(warehouse);

		_.each(warehouse.products, (warehouseProduct) => {
			warehouseProduct.product = warehouseProduct.productId;
		});

		return this.update(warehouse.id, warehouse);
	}

	/**
	 * Check if merchant record exists and not deleted.
	 * Throws exception if not found or deleted.
	 *
	 * @param {string} storeId
	 * @memberof WarehousesService
	 */
	async throwIfNotExists(storeId: string): Promise<void> {
		const store = await super.get(storeId).pipe(first()).toPromise();

		if (!store || store.isDeleted) {
			throw Error(`Store with id '${storeId}' does not exists!`);
		}
	}

	private async _get(id: string, fullProducts = false): Promise<Warehouse> {
		const _warehouse = (await this.Model.findById(id)
			.populate(fullProducts ? 'products.product' : '')
			.lean()
			.exec()) as IWarehouse;

		return new Warehouse(_warehouse);
	}

	private async _getAllCurrentActive(
		fullProducts = false
	): Promise<Warehouse[]> {
		return _.map(
			(await this.Model.find({
				isActive: true,
				isDeleted: { $eq: false },
			})
				.populate(fullProducts ? 'products.product' : '')
				.lean()
				.exec()) as IWarehouse[],
			(warehouse) => new Warehouse(warehouse)
		);
	}
}
