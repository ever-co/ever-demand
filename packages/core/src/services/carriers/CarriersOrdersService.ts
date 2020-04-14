import Logger from 'bunyan';
import _ from 'lodash';
import { createEverLogger } from '../../helpers/Log';
import { ProductsService } from '../products';
import { OrdersService } from '../orders';
import CarriersService from './CarriersService';
import Carrier from '@modules/server.common/entities/Carrier';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { inject, injectable } from 'inversify';
import { WarehousesOrdersService } from '../warehouses';
import ICarrierOrdersRouter from '@modules/server.common/routers/ICarrierOrdersRouter';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import Order from '@modules/server.common/entities/Order';
import IOrder from '@modules/server.common/interfaces/IOrder';
import {
	GeoLocationsOrdersService,
	GeoLocationOrdersOptions,
} from '../geo-locations';
import { getDistance } from '@modules/server.common/utils';
import { ExistenceEventType } from '@pyro/db-server';
import {
	concat,
	distinctUntilChanged,
	exhaustMap,
	filter,
	first,
	map,
	share,
	switchMap,
} from 'rxjs/operators';
import { throwError, of, Observable } from 'rxjs';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

@injectable()
@routerName('carrier-orders')
export class CarriersOrdersService implements ICarrierOrdersRouter, IService {
	/**
	 * Tracking distance in km
	 * TODO: this setting should be per something (e.g. per warehouse, per carrier) stored in the DB
	 *
	 * @static
	 * @memberof CarriersOrdersService
	 */
	static CarrierTrackingDistance = 50000;

	protected log: Logger = createEverLogger({
		name: 'carriersOrdersService',
	});

	constructor(
		@inject(CarriersService)
		protected carriersService: CarriersService,
		@inject(ProductsService)
		protected productsService: ProductsService,
		@inject(OrdersService)
		protected ordersService: OrdersService,
		@inject(GeoLocationsOrdersService)
		protected geoLocationsOrdersService: GeoLocationsOrdersService,
		@inject(WarehousesOrdersService)
		protected warehousesOrdersService: WarehousesOrdersService
	) {}

	@asyncListener()
	async selectedForDelivery(
		carrierId: string,
		orderIds: string[]
	): Promise<Carrier> {
		let carrier = await this.carriersService
			.get(carrierId)
			.pipe(first())
			.toPromise();

		if (carrier != null) {
			if (orderIds.length > 0) {
				// TODO: check here that not from any status it is possible to move to any other.
				// Mean if order is status 3, it's not simply possible to update it to status 2.

				await this.ordersService.updateMultipleByIds(orderIds, {
					carrier: carrierId,
					carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
				});
			}

			carrier = await this.carriersService
				.get(carrierId)
				.pipe(first())
				.toPromise();

			return carrier as Carrier;
		} else {
			throw new Error('Carrier with such id is not found!');
		}
	}

	@asyncListener()
	async getCount(carrierId: string): Promise<number> {
		await this.carriersService.throwIfNotExists(carrierId);

		return this.ordersService.count(
			_.extend(
				{ carrier: carrierId },
				OrdersService.FindObjects.isCompleted
			)
		);
	}

	@asyncListener()
	async skipOrders(carrierId: string, ordersIds: string[]): Promise<Carrier> {
		await this.carriersService.throwIfNotExists(carrierId);

		return this.carriersService.update(carrierId, {
			$push: {
				skippedOrderIds: {
					$each: ordersIds,
				},
			},
		});
	}

	@asyncListener()
	async updateStatus(
		carrierId: string,
		status: OrderCarrierStatus
	): Promise<Carrier> {
		// TODO: check here that not from any status it is possible to move to any other.
		// Mean if order is status 3, it's not simply possible to update it to status 2.

		await this.carriersService.throwIfNotExists(carrierId);

		const findObj = _.extend(
			{ carrier: carrierId },
			OrdersService.FindObjects.isNotCompleted
		);

		const updateObj: any = {
			carrierStatus: status,
		};

		if (status === OrderCarrierStatus.DeliveryCompleted) {
			updateObj.isPaid = true;
			updateObj.deliveryTime = Date.now();
		}

		if (
			status === OrderCarrierStatus.CarrierStartDelivery ||
			status === OrderCarrierStatus.CarrierPickedUpOrder
		) {
			updateObj.startDeliveryTime = Date.now();
		}

		const finishedProcessingStatuses = [
			OrderCarrierStatus.ClientRefuseTakingOrder,
			OrderCarrierStatus.DeliveryCompleted,
			OrderCarrierStatus.IssuesDuringDelivery,
		];

		if (finishedProcessingStatuses.includes(status)) {
			updateObj.finishedProcessingTime = Date.now();
		}

		if ((await this.carriersService.getCurrent(carrierId)) != null) {
			try {
				const orders = await this.ordersService.updateMultiple(
					findObj,
					updateObj
				);

				if (status === OrderCarrierStatus.DeliveryCompleted) {
					return await this.carriersService.increaseNumberOfDeliveries(
						carrierId,
						orders.length
					);
				} else {
					return (await this.carriersService.getCurrent(
						carrierId
					)) as Carrier;
				}
			} catch (err) {
				this.log.error(err);
				throw err;
			}
		} else {
			throw new Error('Carrier with such id is not found!');
		}
	}

	@asyncListener()
	async cancelDelivery(
		carrierId: string,
		orderIds: string[]
	): Promise<Carrier> {
		await this.carriersService.throwIfNotExists(carrierId);

		const _orders = await this.ordersService.find({
			_id: { $in: orderIds },
			isDeleted: { $eq: false },
		});
		const ordersIdsFiltered = _orders.map((d) => d.id);

		const orders = await this.ordersService.updateMultipleByIds(
			ordersIdsFiltered,
			{
				$unset: { carrier: 1 },
				carrierStatus: OrderCarrierStatus.NoCarrier,
			}
		);

		await this.skipOrders(
			carrierId,
			_.map(orders, (order) => order.id)
		);

		return this.carriersService.updateStatus(carrierId, 0);
	}

	@observableListener()
	getAvailable(
		carrierId: string,
		options: { populateWarehouse: boolean } = {
			populateWarehouse: false,
		}
	): Observable<Order[]> {
		return this.carriersService.get(carrierId).pipe(
			map((carrier) => (carrier != null ? carrier.geoLocation : null)),
			distinctUntilChanged((geoLocation1, geoLocation2) => {
				// TODO maybe compare full geoLocation not only coordinates!
				if (geoLocation1 == null || geoLocation2 == null) {
					return true;
				} else {
					return getDistance(geoLocation1, geoLocation2) <= 0.001;
				}
			}),
			switchMap((geoLocation) =>
				geoLocation != null
					? this.geoLocationsOrdersService.get(geoLocation, {
							populateWarehouse: options.populateWarehouse,
					  })
					: throwError(
							new Error(
								`No such a carrier with the id ${carrierId} => can't getAvailable`
							)
					  )
			)
		);
	}

	@observableListener()
	get(
		carrierId: string,
		options: {
			populateWarehouse: boolean;
			completion: 'completed' | 'not-completed' | 'all';
		} = {
			populateWarehouse: false,
			completion: 'not-completed',
		}
	): Observable<Order[]> {
		return of(null).pipe(
			map(async (res) => {
				await this.carriersService.throwIfNotExists(carrierId);
				return res;
			}),
			switchMap((res) => res),
			concat(
				this.ordersService.existence.pipe(
					filter((existenceEvent) => {
						switch (existenceEvent.type as ExistenceEventType) {
							case ExistenceEventType.Created:
								return existenceEvent.value != null
									? existenceEvent.value.carrierId ===
											carrierId
									: false;
							case ExistenceEventType.Updated:
								return (
									(existenceEvent.value != null
										? existenceEvent.value.carrierId ===
										  carrierId
										: false) ||
									(existenceEvent.lastValue != null
										? existenceEvent.lastValue.carrierId ===
										  carrierId
										: false)
								);
							case ExistenceEventType.Removed:
								return existenceEvent.lastValue != null
									? existenceEvent.lastValue.carrierId ===
											carrierId
									: false;
						}
					}),
					share()
				)
			),
			exhaustMap(() => this._get(carrierId, options))
		);
	}

	@asyncListener()
	async getCarrierOrders(
		carrierId: string,
		options: {
			populateWarehouse: boolean;
			completion: 'completed' | 'not-completed' | 'all';
		} = {
			populateWarehouse: false,
			completion: 'not-completed',
		}
	): Promise<IOrder[]> {
		const ordersRaw = (await this.ordersService.Model.find(
			_.extend(
				{ carrier: carrierId, isDeleted: { $eq: false } },
				(() => {
					switch (options.completion) {
						case 'completed':
							return OrdersService.FindObjects.isCompleted;
						case 'not-completed':
							return OrdersService.FindObjects.isNotCompleted;
						case 'all':
							return {};
					}
				})()
			)
		)
			.populate(options.populateWarehouse ? 'warehouse' : '')
			.lean()
			.exec()) as IOrder[];

		return ordersRaw.map((orderRaw) => {
			orderRaw['id'] = orderRaw._id;
			orderRaw.products = orderRaw.products.map((p) => {
				p['id'] = p._id;
				p.product['id'] = p.product._id;
				return p;
			});
			return orderRaw;
		});
	}

	@asyncListener()
	async getCarrierCurrentOrder(carrierId: string): Promise<Order> {
		await this.carriersService.throwIfNotExists(carrierId);

		return this.ordersService.Model.findOne(
			_.assign(this.getOrdersForWorkFilter(carrierId), {
				carrier: carrierId,
			})
		)
			.lean()
			.exec();
	}

	@asyncListener()
	async getCountOfCarrierOrdersHistory(carrierId: string): Promise<number> {
		await this.carriersService.throwIfNotExists(carrierId);
		return this.ordersService.Model.find({ carrier: carrierId })
			.countDocuments()
			.exec();
	}

	@asyncListener()
	async getCarrierOrdersHistory(
		carrierId: string,
		options: GeoLocationOrdersOptions
	): Promise<Order[]> {
		await this.carriersService.throwIfNotExists(carrierId);

		const dbOrders = await this.ordersService.Model.find({
			carrier: carrierId,
		})
			.sort({
				_createdAt:
					options.sort && options.sort.toLowerCase().includes('desc')
						? 'desc'
						: 'asc',
			})
			.skip(options.skip || 0)
			.limit(options.limit || 1)
			.lean()
			.exec();

		return dbOrders.map((o: IOrder) => new Order(o));
	}

	private async _get(
		carrierId: string,
		options: {
			populateWarehouse: boolean;
			completion: 'completed' | 'not-completed' | 'all';
		}
	): Promise<Order[]> {
		await this.carriersService.throwIfNotExists(carrierId);

		try {
			const ordersRaw = (await this.ordersService.Model.find(
				_.extend(
					{ carrier: carrierId, isDeleted: { $eq: false } },
					(() => {
						switch (options.completion) {
							case 'completed':
								return OrdersService.FindObjects.isCompleted;
							case 'not-completed':
								return OrdersService.FindObjects.isNotCompleted;
							case 'all':
								return {};
						}
					})()
				)
			)
				.populate(options.populateWarehouse ? 'warehouse' : '')
				.lean()
				.exec()) as IOrder[];

			return _.map(ordersRaw, (orderRaw) => new Order(orderRaw));
		} catch (err) {
			this.log.error(err);
			throw err;
		}
	}

	private getOrdersForWorkFilter(carrierId: string) {
		return {
			carrierStatus: {
				$nin: [
					OrderCarrierStatus.IssuesDuringDelivery,
					OrderCarrierStatus.ClientRefuseTakingOrder,
					OrderCarrierStatus.DeliveryCompleted,
				],
			},
			warehouseStatus: {
				$in: [
					OrderWarehouseStatus.PackagingFinished,
					OrderWarehouseStatus.GivenToCarrier,
				],
			},
			$or: [{ carrier: null }, { carrier: carrierId }],
		};
	}
}
