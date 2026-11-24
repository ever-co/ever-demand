import Logger from 'bunyan';
import * as _ from 'lodash';
import { createEverLogger } from '../../helpers/Log';
import { ProductsService } from '../products';
import { OrdersService } from '../orders';
import CarriersService from './CarriersService';
import Carrier from '@modules/server.common/entities/Carrier';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { inject, injectable } from 'inversify';
import { WarehousesOrdersService, WarehousesService } from '../warehouses';
import ICarrierOrdersRouter from '@modules/server.common/routers/ICarrierOrdersRouter';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import Order from '@modules/server.common/entities/Order';
import IOrder from '@modules/server.common/interfaces/IOrder';
import {
	GeoLocationsOrdersService,
	GeoLocationOrdersOptions,
} from '../geo-locations';
import Utils, { getDistance } from '@modules/server.common/utils';
import { estimateDeliverySeconds } from '../../helpers/deliveryEstimate';
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
import {
	isCarrierStatusTransitionAllowed,
	notCancelledOrderFilter,
} from '../orders/orderStatusTransitions';
import { throwIfInvalidOrderIds } from '../../helpers/objectIds';

/**
 * Carrier statuses of the orders a carrier is still working on. An order that
 * was delivered, returned with an issue or refused by the client is not one.
 */
const activeCarrierStatuses = [
	OrderCarrierStatus.NoCarrier,
	OrderCarrierStatus.CarrierSelectedOrder,
	OrderCarrierStatus.CarrierPickedUpOrder,
	OrderCarrierStatus.CarrierStartDelivery,
	OrderCarrierStatus.CarrierArrivedToCustomer,
];

/**
 * Carrier statuses of the orders a carrier can give back with `cancelDelivery`:
 * the active ones, once the carrier has the order.
 */
const cancellableCarrierStatuses = activeCarrierStatuses.filter(
	(status) => status !== OrderCarrierStatus.NoCarrier
);

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
		protected warehousesOrdersService: WarehousesOrdersService,
		@inject(WarehousesService)
		protected warehousesService: WarehousesService
	) {}

	@asyncListener()
	async selectedForDelivery(
		carrierId: string,
		orderIds: string[],
		carrierCompetition?: boolean
	): Promise<Carrier> {
		let carrier = await this.carriersService
			.get(carrierId)
			.pipe(first())
			.toPromise();

		if (carrier != null) {
			if (orderIds.length > 0) {
				const carrierStatus = carrierCompetition
					? OrderCarrierStatus.CarrierPickedUpOrder
					: OrderCarrierStatus.CarrierSelectedOrder;

				const competitionWarehouseIds =
					await this.getCarrierCompetitionWarehouseIds(orderIds);

				// Only orders a carrier may still take: not cancelled, and free,
				// already selected by this carrier, or selected by another
				// carrier in a store where carriers compete for orders (the
				// orders `GeoLocationsOrdersService` offers). An order picked
				// up, in delivery or finished keeps its carrier and status.
				const orders = await this.ordersService.updateMultiple(
					{
						_id: { $in: orderIds },
						isDeleted: { $eq: false },
						isCancelled: { $eq: false },
						$or: [
							{ carrierStatus: OrderCarrierStatus.NoCarrier },
							{
								carrier: carrierId,
								carrierStatus:
									OrderCarrierStatus.CarrierSelectedOrder,
							},
							{
								warehouse: { $in: competitionWarehouseIds },
								carrierStatus:
									OrderCarrierStatus.CarrierSelectedOrder,
							},
						],
					},
					{
						carrier: carrierId,
						carrierStatus,
					}
				);

				// `updateMultiple` returns the orders its first read matched, as
				// they are after the write. The write checks the filter again,
				// so an order another carrier took in between keeps that
				// carrier: count only the orders this carrier now has.
				const takenOrders = orders.filter(
					(order) =>
						order.carrierId === carrierId &&
						order.carrierStatus === carrierStatus
				);

				if (takenOrders.length === 0) {
					throw new Error('Orders are no longer available');
				}

				// In a competition store taking the order is "Got product"
				if (carrierCompetition) {
					await this.setDeliveryTimeEstimates(
						carrierId,
						carrier,
						takenOrders,
						carrierStatus
					);
				}
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
		// The carrier's work queries turn every skipped id into an ObjectId,
		// so one bad id would break that carrier's work list.
		throwIfInvalidOrderIds(ordersIds);

		await this.carriersService.throwIfNotExists(carrierId);

		// $addToSet: skipping an order again does not store it twice. Ids are
		// stored in lower case, so an upper-case spelling of the same order
		// is not added a second time.
		return this.carriersService.update(carrierId, {
			$addToSet: {
				skippedOrderIds: {
					$each: ordersIds.map((id) => id.toLowerCase()),
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

		// Only orders the carrier is still working on, and only those that may
		// move to `status` (the rules `OrdersService.updateCarrierStatus` uses).
		// Delivered, returned or refused orders keep their status, paid or not.
		const fromStatuses = activeCarrierStatuses.filter((current) =>
			isCarrierStatusTransitionAllowed(current, status)
		);

		const findObj = _.extend(
			{
				carrier: carrierId,
				carrierStatus: { $in: fromStatuses },
			},
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
			// Nothing is left to deliver: no time estimate either.
			updateObj.deliveryTimeEstimate = 0;
		}

		const currentCarrier = await this.carriersService.getCurrent(carrierId);

		if (currentCarrier != null) {
			try {
				const orders = await this.ordersService.updateMultiple(
					findObj,
					updateObj
				);

				if (
					status === OrderCarrierStatus.CarrierStartDelivery ||
					status === OrderCarrierStatus.CarrierPickedUpOrder
				) {
					await this.setDeliveryTimeEstimates(
						carrierId,
						currentCarrier,
						orders,
						status
					);
				}

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

		const requestedOrders = await this.ordersService.find({
			_id: { $in: orderIds },
			isDeleted: { $eq: false },
		});

		// Only this carrier's orders that are still in progress, checked by
		// the write itself. Another carrier's order, or one delivered,
		// returned or refused, keeps its carrier and status.
		await this.ordersService.updateMultiple(
			{
				_id: { $in: orderIds },
				isDeleted: { $eq: false },
				carrier: carrierId,
				carrierStatus: { $in: cancellableCarrierStatuses },
			},
			{
				$unset: { carrier: 1 },
				carrierStatus: OrderCarrierStatus.NoCarrier,
				// No carrier is on the way any more
				deliveryTimeEstimate: 0,
			}
		);

		// The carrier gives up every requested order, as before. This
		// includes an order in a competition store that it never took: the
		// carrier app offers Cancel on it, and it must stop being offered.
		await this.skipOrders(
			carrierId,
			_.map(requestedOrders, (order) => order.id)
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
					: throwError(() =>
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

	/**
	 * Stores, for each order the carrier now has in `status`, how many seconds
	 * the carrier needs to reach the customer from where the carrier is now
	 * (`Order.deliveryTimeEstimate`). An order or carrier without a location
	 * keeps its estimate. A failure here is logged and never fails the status
	 * change itself.
	 */
	private async setDeliveryTimeEstimates(
		carrierId: string,
		carrier: Carrier,
		orders: Order[],
		status: OrderCarrierStatus
	): Promise<void> {
		const carrierLoc = carrier?.geoLocation?.loc;

		if (!carrierLoc || !Array.isArray(carrierLoc.coordinates)) {
			return;
		}

		// `updateMultiple` returns every order its first read matched, also
		// one its write then left alone: estimate only the orders it moved.
		const movedOrders = orders.filter(
			(order) =>
				order != null &&
				order.carrierId === carrierId &&
				order.carrierStatus === status
		);

		await Promise.all(
			movedOrders.map(async (order) => {
				try {
					const customerLoc = order.user?.geoLocation?.loc;

					if (
						!customerLoc ||
						!Array.isArray(customerLoc.coordinates)
					) {
						return;
					}

					const deliveryTimeEstimate = estimateDeliverySeconds(
						Utils.getLocDistance(carrierLoc, customerLoc)
					);

					if (deliveryTimeEstimate > 0) {
						// Written only while the order still has this carrier
						// and status: a delivery, return or cancel that lands
						// in between keeps its cleared estimate.
						await this.ordersService.updateMultiple(
							{
								_id: order.id,
								carrier: carrierId,
								carrierStatus: status,
								isCancelled: { $ne: true },
							},
							{ deliveryTimeEstimate }
						);
					}
				} catch (err) {
					this.log.error(err);
				}
			})
		);
	}

	/**
	 * Ids of the stores with `carrierCompetition` among the stores of the given
	 * orders that a carrier has selected. In those stores every carrier is
	 * offered such an order and may still take it.
	 */
	private async getCarrierCompetitionWarehouseIds(
		orderIds: string[]
	): Promise<string[]> {
		const selectedOrders = await this.ordersService.find({
			_id: { $in: orderIds },
			isDeleted: { $eq: false },
			carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
		});

		const warehouseIds = _.uniq(
			selectedOrders.map((order) => order.warehouseId)
		);

		if (warehouseIds.length === 0) {
			return [];
		}

		const warehouses = await this.warehousesService.find({
			_id: { $in: warehouseIds },
			carrierCompetition: true,
		});

		return warehouses.map((warehouse) => warehouse.id);
	}

	/**
	 * Mongo filter for the orders a carrier still works on: not cancelled, not
	 * deleted, not finished and ready for or given to the carrier. A cancelled
	 * order keeps its carrier and carrier status, so without the cancel check it
	 * would stay the carrier's current order.
	 */
	private getOrdersForWorkFilter(carrierId: string) {
		return {
			...notCancelledOrderFilter,
			isDeleted: { $eq: false },
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
