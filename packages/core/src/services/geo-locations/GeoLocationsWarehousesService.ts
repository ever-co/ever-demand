import { injectable } from 'inversify';
import Logger from 'bunyan';
import _ from 'lodash';
import Utils from '@modules/server.common/utils';
import { createEverLogger } from '../../helpers/Log';
import { WarehousesService } from '../warehouses';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import Warehouse from '@modules/server.common/entities/Warehouse';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import { Observable } from 'rxjs';
import {
	observableListener,
	routerName,
	serialization,
	asyncListener,
} from '@pyro/io';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import IGeoLocationWarehousesRouter from '@modules/server.common/routers/IGeoLocationWarehousesRouter';
import IService from '../IService';
import { ExistenceEventType } from '@pyro/db-server';
import { of } from 'rxjs/observable/of';
import { concat, exhaustMap, filter, share } from 'rxjs/operators';

@injectable()
@routerName('geo-location-warehouses')
export class GeoLocationsWarehousesService
	implements IGeoLocationWarehousesRouter, IService {
	protected log: Logger = createEverLogger({
		name: 'geoLocationsWarehousesService',
	});

	// TODO: this should be something dynamic and stored in DB (per Warehouse?)
	static TrackingDistance: number = 50000;

	static isNearly(warehouse: Warehouse, geoLocation: GeoLocation): boolean {
		return (
			Utils.getDistance(warehouse.geoLocation, geoLocation) <=
			GeoLocationsWarehousesService.TrackingDistance
		);
	}

	constructor(protected warehousesService: WarehousesService) {}

	@observableListener()
	get(
		@serialization((g: IGeoLocation) => new GeoLocation(g))
		geoLocation: GeoLocation,
		@serialization((o: any) => _.omit(o, ['fullProducts', 'activeOnly']))
		_options?: { fullProducts?: boolean; activeOnly?: boolean }
	): Observable<Warehouse[]> {
		const options = {
			fullProducts: _options != null && _options.fullProducts != null,
			activeOnly:
				_options != null && _options.activeOnly != null
					? _options.activeOnly
					: false,
		};

		return of(null).pipe(
			concat(
				this.warehousesService.existence.pipe(
					filter((existenceEvent) => {
						let warehouse: Warehouse | null;
						let oldWarehouse: Warehouse | null;

						switch (existenceEvent.type as ExistenceEventType) {
							case ExistenceEventType.Created:
								warehouse = existenceEvent.value;

								if (warehouse == null) {
									return false;
								}

								return (
									GeoLocationsWarehousesService.isNearly(
										warehouse,
										geoLocation
									) &&
									(options.activeOnly
										? warehouse.isActive
										: true)
								);

							case ExistenceEventType.Updated:
								warehouse = existenceEvent.value;
								oldWarehouse = existenceEvent.lastValue;

								if (warehouse == null || oldWarehouse == null) {
									return false;
								}

								return (
									GeoLocationsWarehousesService.isNearly(
										warehouse,
										geoLocation
									) !==
										GeoLocationsWarehousesService.isNearly(
											oldWarehouse,
											geoLocation
										) &&
									(options.activeOnly
										? warehouse.isActive !==
										  oldWarehouse.isActive
										: true)
								);

							case ExistenceEventType.Removed:
								oldWarehouse = existenceEvent.lastValue;

								if (oldWarehouse == null) {
									return false;
								}

								return (
									GeoLocationsWarehousesService.isNearly(
										oldWarehouse,
										geoLocation
									) &&
									(options.activeOnly
										? oldWarehouse.isActive
										: true)
								);
						}
					}),
					share()
				)
			),
			exhaustMap(() =>
				this._get(
					geoLocation,
					GeoLocationsWarehousesService.TrackingDistance,
					options
				)
			),
			share()
		);
	}

	@asyncListener()
	async getMerchants(
		geoLocation: IGeoLocation,
		maxDistance: number,
		options: {
			fullProducts: boolean;
			activeOnly: boolean;
			merchantsIds?: string[];
		}
	): Promise<IWarehouse[]> {
		const merchantsIds = options.merchantsIds;
		const merchants = (await this.warehousesService.Model.find(
			_.assign(
				{
					'geoLocation.loc': {
						$near: {
							$geometry: {
								type: 'Point',
								coordinates: geoLocation.loc.coordinates,
							},
							$maxDistance: maxDistance,
						},
					},
				},
				options.activeOnly ? { isActive: true } : {},
				merchantsIds && merchantsIds.length > 0
					? {
							_id: { $in: merchantsIds },
					  }
					: {}
			)
		)
			.populate(options.fullProducts ? 'products.product' : '')
			.lean()
			.exec()) as IWarehouse[];

		return merchants;
	}

	/**
	 * Get warehouses available for given location
	 *
	 * @private
	 * @param {GeoLocation} geoLocation
	 * @param {number} maxDistance
	 * @param {{ fullProducts: boolean; activeOnly: boolean }} options
	 * @returns {Promise<Warehouse[]>}
	 * @memberof GeoLocationsWarehousesService
	 */
	private async _get(
		geoLocation: GeoLocation,
		maxDistance: number,
		options: { fullProducts: boolean; activeOnly: boolean }
	): Promise<Warehouse[]> {
		// TODO: first filter by City / Country and only then look up by coordinates
		const warehouses = (await this.warehousesService.Model.find(
			_.assign(
				{
					'geoLocation.loc': {
						$near: {
							$geometry: {
								type: 'Point',
								coordinates: geoLocation.loc.coordinates,
							},

							// TODO: set distance PER warehouse?
							// It's hard to make this work however, as seems this should be constant value...
							// however we may want to check MongoDB docs!
							$maxDistance: maxDistance,
						},
					},
				},
				options.activeOnly ? { isActive: true } : {}
			)
		)
			.populate(options.fullProducts ? 'products.product' : '')
			.lean()
			.exec()) as IWarehouse[];

		return warehouses.map((warehouse) => new Warehouse(warehouse));
	}
}
