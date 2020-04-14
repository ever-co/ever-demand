import { inject, injectable } from 'inversify';
import { OrdersService } from '../orders';
import Warehouse from '@modules/server.common/entities/Warehouse';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import _ from 'lodash';
import Logger from 'bunyan';
import Order from '@modules/server.common/entities/Order';
import { createEverLogger } from '../../helpers/Log';
import { GeoLocationsWarehousesService } from './GeoLocationsWarehousesService';
import Bluebird from 'bluebird';
import {
	WarehousesProductsService,
	WarehousesOrdersService,
	WarehousesService,
} from '../warehouses';
import {
	observableListener,
	routerName,
	serialization,
	asyncListener,
} from '@pyro/io';
import IGeoLocationOrdersRouter from '@modules/server.common/routers/IGeoLocationOrdersRouter';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import IService from '../IService';
import { ExistenceEventType } from '@pyro/db-server';
import { concat, exhaustMap, filter, first, share } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { from } from 'rxjs/observable/from';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { GeoLocationOrdersOptions } from './GeoLocationOrdersOptions';
import { ObjectId } from 'bson';

@injectable()
@routerName('geo-location-orders')
export class GeoLocationsOrdersService
	implements IGeoLocationOrdersRouter, IService {
	protected readonly log: Logger = createEverLogger({
		name: 'geoLocationsOrdersService',
	});

	constructor(
		@inject(OrdersService) protected ordersService: OrdersService,
		@inject(WarehousesService)
		protected warehousesService: WarehousesService,
		@inject(GeoLocationsWarehousesService)
		protected geoLocationsWarehousesService: GeoLocationsWarehousesService,
		@inject(WarehousesProductsService)
		protected warehousesProductsService: WarehousesProductsService,
		@inject(WarehousesOrdersService)
		protected warehousesOrdersService: WarehousesOrdersService
	) {}

	@observableListener()
	get(
		@serialization(
			(geoLocationParam: IGeoLocation) =>
				new GeoLocation(geoLocationParam)
		)
		geoLocation: GeoLocation,
		options: { populateWarehouse?: boolean; populateCarrier?: boolean } = {}
	) {
		return of(null).pipe(
			concat(
				this.ordersService.existence.pipe(
					exhaustMap((existenceEvent) => {
						switch (existenceEvent.type as ExistenceEventType) {
							case ExistenceEventType.Created:
							case ExistenceEventType.Updated:
								if (existenceEvent.value != null) {
									return this.warehousesService
										.get(existenceEvent.value.warehouseId)
										.pipe(first());
								} else {
									return this.warehousesService
										.get('wrong')
										.pipe(first());
								}
							case ExistenceEventType.Removed:
								if (existenceEvent.lastValue != null) {
									return this.warehousesService
										.get(
											existenceEvent.lastValue.warehouseId
										)
										.pipe(first());
								} else {
									return this.warehousesService
										.get('wrong')
										.pipe(first());
								}
						}
					}),
					filter((warehouse) =>
						warehouse != null
							? GeoLocationsWarehousesService.isNearly(
									warehouse,
									geoLocation
							  )
							: true
					),
					share()
				)
			),
			exhaustMap(() => from(this._get(geoLocation, options)))
		);
	}

	@asyncListener()
	async getCountOfOrdersForWork(
		geoLocation: IGeoLocation,
		skippedOrderIds: string[] = [],
		searchObj?: { byRegex: Array<{ key: string; value: string }> }
	): Promise<number> {
		const merchants = await this.geoLocationsWarehousesService.getMerchants(
			geoLocation,
			GeoLocationsWarehousesService.TrackingDistance,
			{ fullProducts: false, activeOnly: true }
		);

		const merchantsIds = merchants.map((m) => m._id);

		let searchByRegex = [];

		if (searchObj && searchObj.byRegex.length > 0) {
			searchByRegex = searchObj.byRegex.map((s) => {
				return { [s.key]: { $regex: s.value, $options: 'i' } };
			});
		}

		return this.ordersService.Model.find(
			_.assign(
				{
					warehouse: { $in: merchantsIds },
					warehouseStatus: {
						$eq: OrderWarehouseStatus.PackagingFinished,
					},
					carrierStatus: {
						$lte: OrderCarrierStatus.CarrierSelectedOrder,
					},
					_id: { $nin: skippedOrderIds },
				},
				...searchByRegex
			)
		)
			.countDocuments()
			.exec();
	}

	@asyncListener()
	async getOrdersForWork(
		geoLocation: IGeoLocation,
		skippedOrderIds: string[] = [],
		options: GeoLocationOrdersOptions,
		searchObj?: {
			isCancelled?: boolean;
			byRegex?: Array<{ key: string; value: string }>;
		}
	): Promise<Order[]> {
		const merchants = await this.geoLocationsWarehousesService.getMerchants(
			geoLocation,
			GeoLocationsWarehousesService.TrackingDistance,
			{ fullProducts: false, activeOnly: true }
		);

		const merchantsIds = merchants.map((m) => m._id.toString());

		let searchByRegex = [];

		if (searchObj) {
			const byRegex = searchObj.byRegex;

			if (byRegex && byRegex.length > 0) {
				searchByRegex = byRegex.map((s) => {
					return { [s.key]: { $regex: s.value, $options: 'i' } };
				});
			}

			const isCancelled = searchObj.isCancelled;

			if (isCancelled != null) {
				searchByRegex.push({ isCancelled });
			}
		}

		const orders = await this.ordersService.Model.aggregate([
			{
				$match: _.assign(
					{
						warehouse: { $in: merchantsIds },
						warehouseStatus: {
							$eq: OrderWarehouseStatus.PackagingFinished,
						},
						carrierStatus: {
							$lte: OrderCarrierStatus.CarrierSelectedOrder,
						},
						_id: {
							$nin: skippedOrderIds.map((id) => new ObjectId(id)),
						},
					},
					...searchByRegex
				),
			},
			{
				$sort: {
					_createdAt:
						options.sort &&
						options.sort.toLowerCase().includes('desc')
							? -1
							: 1,
				},
			},
		])
			.allowDiskUse(true)
			.skip(options.skip || 0)
			.limit(options.limit || 1)
			.exec();

		return orders.filter((o) => o !== null).map((o) => new Order(o));
	}

	/**
	 * Get Orders from Warehouses near the given location
	 *
	 * @private
	 * @param {GeoLocation} geoLocation
	 * @param {{ populateWarehouse?: boolean; populateCarrier?: boolean }} [options={}]
	 * @returns {Promise<Order[]>}
	 * @memberof GeoLocationsOrdersService
	 */
	private async _get(
		geoLocation: GeoLocation,
		options: { populateWarehouse?: boolean; populateCarrier?: boolean } = {}
	): Promise<Order[]> {
		// First we look up warehouses which can contain interesting orders because they are close enough to given location
		// Note: we can't embed warehouse location into order document itself,
		// because warehouses could MOVE in theory while we process order.
		// Next we will get all orders from founded warehouses

		const warehouses = await this.geoLocationsWarehousesService
			.get(geoLocation, { activeOnly: true })
			.pipe(first())
			.toPromise();

		this.log.info(
			{
				geoLocation,
				warehouses,
			},
			'warehouses by location'
		);

		const orders = _.flatten(
			await Bluebird.map(warehouses, async (warehouse: Warehouse) => {
				const warehouseOrders = await this.warehousesOrdersService
					.get(warehouse.id, {
						populateCarrier: !!options.populateCarrier,
					})
					.pipe(first())
					.toPromise();

				if (options.populateWarehouse) {
					_.each(
						warehouseOrders,
						(order) => (order.warehouse = warehouse)
					);
				}

				this.log.info(
					{
						geoLocation,
						warehouseOrders,
						warehouse,
					},
					'orders by warehouse'
				);

				return warehouseOrders;
			})
		);

		this.log.info(
			{
				geoLocation,
				orders,
			},
			'orders by warehouses'
		);

		return orders;
	}
}
