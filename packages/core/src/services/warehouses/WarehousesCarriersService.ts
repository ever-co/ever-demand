import { inject, injectable, LazyServiceIdentifier } from 'inversify';
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
		@inject(new LazyServiceIdentifier(() => CarriersService))
		private readonly carriersService: CarriersService,
		@inject(new LazyServiceIdentifier(() => WarehousesService))
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
	 * Update the password of a carrier that only the calling merchant uses.
	 * Refused unless `token` is a valid merchant ('warehouse') login token,
	 * the carrier is in that merchant's usedCarriersIds, no other merchant
	 * (not deleted) lists the carrier and the carrier exists and is not a
	 * shared carrier.
	 *
	 * Merchants can write their own usedCarriersIds (warehouse.register and
	 * warehouse.save), so listing a carrier alone proves nothing. A carrier
	 * that another merchant also lists cannot be reset by either of them.
	 * Known gap: a carrier that no merchant lists yet can still be claimed by
	 * registering a merchant that lists it. Closing that needs auth or a
	 * server-set owner on warehouse.register/save.
	 *
	 * Every refusal throws the same error, so a caller learns nothing about
	 * which check failed.
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
		const notAuthorized = () =>
			new Error('Not authorized to update the carrier password');

		const warehouseId = this.authService.getVerifiedId(token, 'warehouse');

		if (warehouseId == null) {
			throw notAuthorized();
		}

		const warehouse = await this.warehousesService.getCurrent(warehouseId);

		if (
			warehouse == null ||
			warehouse.isDeleted ||
			!_.includes(warehouse.usedCarriersIds, id)
		) {
			throw notAuthorized();
		}

		// `id` matched an entry of usedCarriersIds above, so it is a plain id
		// string and safe to put in a query.
		const otherWarehousesUsingCarrier = await this.warehousesService.count({
			_id: { $ne: warehouse.id },
			usedCarriersIds: id,
			isDeleted: { $ne: true },
		});

		if (otherWarehousesUsingCarrier > 0) {
			throw notAuthorized();
		}

		const carrier = await this.carriersService.getCurrent(id);

		// The two checks above compare `id` as an exact string against
		// usedCarriersIds, but getCurrent casts it to an ObjectId, whose hex is
		// case-insensitive. Without this, a store that lists the victim's id in
		// upper case passes both checks (the victim's store lists it in lower
		// case) and resets the victim's carrier. Only the canonical id counts.
		if (
			carrier == null ||
			String(carrier.id) !== id ||
			carrier.isDeleted ||
			carrier.isSharedCarrier
		) {
			throw notAuthorized();
		}

		await this.authService._savePassword(id, password);
	}
}
