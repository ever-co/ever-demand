import Logger from 'bunyan';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import moment from 'moment';
import Bluebird from 'bluebird';
import { createEverLogger } from '../../helpers/Log';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import Order from '@modules/server.common/entities/Order';
import Product from '@modules/server.common/entities/Product';
import { WarehousesService } from './WarehousesService';
import { ProductsService } from '../products';
import { OrdersService } from '../orders';
import { IOrderProductCreateObject } from '@modules/server.common/interfaces/IOrderProduct';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { WarehousesProductsService } from './WarehousesProductsService';
import IWarehouseOrdersRouter, {
	IOrderCreateInput,
} from '@modules/server.common/routers/IWarehouseOrdersRouter';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import { UsersService } from '../users';
import IService from '../IService';
import {
	exhaustMap,
	filter,
	first,
	share,
	switchMap,
	map,
} from 'rxjs/operators';
import { ExistenceEvent, ExistenceEventType } from '@pyro/db-server';
import { concat, of, Observable } from 'rxjs';
import Warehouse, {
	WithFullProducts,
} from '@modules/server.common/entities/Warehouse';
import _ = require('lodash');
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import User from '@modules/server.common/entities/User';

/**
 * Warehouses Orders Service
 *
 * @export
 * @class WarehousesOrdersService
 * @implements {IWarehouseOrdersRouter}
 * @implements {IService}
 */
@injectable()
@routerName('warehouse-orders')
export class WarehousesOrdersService
	implements IWarehouseOrdersRouter, IService {
	protected log: Logger = createEverLogger({
		name: 'warehousesOrdersService',
	});

	constructor(
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		protected warehousesService: WarehousesService,
		@inject(new LazyServiceIdentifer(() => ProductsService))
		protected productsService: ProductsService,
		@inject(new LazyServiceIdentifer(() => WarehousesProductsService))
		protected warehousesProductsService: WarehousesProductsService,
		@inject(new LazyServiceIdentifer(() => OrdersService))
		protected ordersService: OrdersService,
		@inject(new LazyServiceIdentifer(() => UsersService))
		protected usersService: UsersService
	) {}

	/**
	 * TODO: document
	 *
	 * @param {Warehouse['id']} warehouseId
	 * @returns {Observable<ExistenceEvent<Order>>}
	 * @memberof WarehousesOrdersService
	 */
	getExistence(
		warehouseId: Warehouse['id']
	): Observable<ExistenceEvent<Order>> {
		return this.ordersService.existence.pipe(
			filter((existenceEvent) => {
				switch (existenceEvent.type as ExistenceEventType) {
					case ExistenceEventType.Created:
						return (
							existenceEvent.value != null &&
							existenceEvent.value.warehouseId === warehouseId
						);

					case ExistenceEventType.Updated:
						return (
							(existenceEvent.value != null &&
								existenceEvent.value.warehouseId ===
									warehouseId) ||
							(existenceEvent.lastValue != null &&
								existenceEvent.lastValue.warehouseId ===
									warehouseId)
						);

					case ExistenceEventType.Removed:
						return (
							existenceEvent.lastValue != null &&
							existenceEvent.lastValue.warehouseId === warehouseId
						);
				}
			}),
			share()
		);
	}

	/**
	 * Get Orders from given Warehouse
	 *
	 * @param {Warehouse['id']} warehouseId
	 * @returns {Observable<Order[]>}
	 * @memberof WarehousesOrdersService
	 */
	@observableListener()
	get(
		warehouseId: Warehouse['id'],
		options: {
			populateWarehouse?: boolean;
			populateCarrier?: boolean;
			order?: boolean;
		} = {}
	): Observable<Order[]> {
		return concat(of(null), this.getExistence(warehouseId)).pipe(
			map(async (res) => {
				await this.warehousesService.throwIfNotExists(warehouseId);
				return res;
			}),
			switchMap((res) => res),
			exhaustMap(() =>
				this._get(warehouseId, {
					populateWarehouse: !!options.populateWarehouse,
					populateCarrier: !!options.populateCarrier,
					onlyAvailableToCarrier: false,
				})
			)
		);
	}

	/**
	 * Get next order number in given Store
	 * Implemented simple, but not efficient/stable way:
	 * - go over existed orders in the Store
	 * - find last one
	 * - return number of last one plus 1
	 *
	 * Will NOT work well if called in parallel, unless we:
	 * TODO: implement distributed locking or store last order id separately
	 *
	 * @param {string} warehouseId
	 * @returns {Promise<number>}
	 * @memberof WarehousesOrdersService
	 */
	async getNextOrderNumber(warehouseId: string): Promise<number> {
		await this.warehousesService.throwIfNotExists(warehouseId);

		const orderDocument = (await this.ordersService.Model.findOne({
			warehouse: warehouseId,
			isDeleted: { $eq: false },
			_createdAt: {
				$gte: (<any>moment)().startOf('day').toDate(),
			},
		})
			.select('orderNumber')
			.sort({ orderNumber: -1 })
			.exec()) as any;

		if (orderDocument == null) {
			return 1;
		} else {
			return orderDocument.orderNumber + 1;
		}
	}

	/**
	 * Order for multiple products
	 * User always order product from specific store because the price and availability is per store
	 * It is possible that user is null.
	 * In this case, it mean that customer does not purchase products yet, but carrier arrives to warehouse
	 * and get this specific products and he is ready to delivery them to customer
	 * (in such advanced scenarios, we create "orders", assign carriers, but do not assign customer yet)
	 *
	 * @param {IOrderCreateInput} {
	 * 		warehouseId,
	 * 		userId,
	 * 		products,
	 * 		options
	 * 	}
	 * @returns {Promise<Order>}
	 * @memberof WarehousesOrdersService
	 */
	@asyncListener()
	async create({
		warehouseId,
		userId,
		products,
		orderType,
		waitForCompletion,
		options,
	}: IOrderCreateInput): Promise<Order> {
		if (!options) {
			options = {};
		}

		options = {
			autoConfirm: !!options.autoConfirm,
		};

		const user = await this._getUser(userId);
		const warehouse = await this._getWarehouse(warehouseId);

		const warehouseProducts = _.keyBy(warehouse.products, 'productId');

		this.log.info(
			{
				user,
				warehouseId,
				products,
			},
			'Order create call'
		);

		// If no image was given from client side for an order product,
		// we should copy it from product in DB
		const orderProducts = await this._getOrderProducts(
			products,
			warehouseProducts
		);

		// TODO next should be in the single transaction!
		// (i.e. create order and decrease product availability in the warehouse)
		// http://mongoosejs.com/docs/transactions.html

		const order = await this.ordersService.create({
			user,
			products: orderProducts,
			warehouse: warehouseId,
			orderNumber: await this.getNextOrderNumber(warehouseId),
			orderType,
			waitForCompletion: !!waitForCompletion,
			...(options.autoConfirm ? { isConfirmed: true } : {}),
		});

		// we do all remove operations and notify about warehouse orders change after we remove products from warehouse
		await this._updateProductCount(order, warehouseId);

		return order;
	}

	/**
	 * User complete order
	 *
	 * @param {string} orderId
	 * @returns {Promise<Order>}
	 * @memberof WarehousesOrdersService
	 */
	@asyncListener()
	async userComplete(orderId): Promise<Order> {
		const order = await this.ordersService.update(orderId, {
			waitForCompletion: false,
		});

		return order;
	}

	/**
	 * Add product to existed order
	 *
	 * @param {string} warehouseId
	 * @param {string} userId
	 * @param {string} orderId
	 * @param {IOrderCreateInputProduct} product
	 * @returns {Promise<Order>}
	 * @memberof WarehousesOrdersService
	 */
	@asyncListener()
	async addMore(warehouseId, userId, orderId, products): Promise<Order> {
		const existedOrder = await this.ordersService
			.get(orderId)
			.pipe(first())
			.toPromise();

		if (existedOrder.warehouseId !== warehouseId) {
			throw new Error(
				`The order is not used by warehouse with Id ${warehouseId}`
			);
		}

		if (existedOrder.user.id !== userId) {
			throw new Error(`The order is not used by user with Id ${userId}`);
		}

		const user = await this._getUser(userId);
		const warehouse = await this._getWarehouse(warehouseId);

		const warehouseProducts = _.keyBy(warehouse.products, 'productId');

		this.log.info(
			{ user, warehouseId, orderId, products },
			'Add more products call'
		);

		const orderProducts = await this._getOrderProducts(
			products,
			warehouseProducts
		);

		const newProducts = [...existedOrder.products, ...orderProducts];

		const order = await this.ordersService.update(orderId, {
			products: newProducts,
		});

		// TODO investigate why bellow function throw error when adding new product
		await this._updateProductCount(order, warehouseId);

		return order;
	}

	/**
	 * Create Order by given customer in the given Store for 1 specific product
	 * (optimized for single product purchases)
	 *
	 * @param {string} userId
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @returns {Promise<Order>}
	 * @memberof WarehousesOrdersService
	 */
	@asyncListener()
	async createByProductType(
		userId: string,
		warehouseId: string,
		productId: string,
		orderType?: DeliveryType
	): Promise<Order> {
		await this.usersService.throwIfNotExists(userId);
		await this.warehousesService.throwIfNotExists(warehouseId);
		await this.productsService.throwIfNotExists(productId);

		return this.create({
			userId,
			warehouseId,
			orderType,
			products: [
				{
					productId,
					count: 1,
				},
			],
		});
	}

	/**
	 * Cancel an order.
	 * Money back and cancel shipping to the client if it's started already
	 * For non-confirmed orders we only increase availability
	 * For confirmed orders we increase availability, return payment and cancel shipping
	 *
	 * @param {string} orderId
	 * @returns {Promise<Order>}
	 * @memberof WarehousesOrdersService
	 */
	@asyncListener()
	async cancel(orderId: string): Promise<Order> {
		let order = await this.ordersService
			.get(orderId)
			.pipe(first())
			.toPromise();

		if (order == null) {
			throw new Error(
				`There is no order with the id ${orderId} to cancel`
			);
		}

		if (order.isCancelled) {
			this.log.warn(`Order with id ${orderId} is already cancelled!`);
			return;
		}

		// canceling order
		order = await this.ordersService.cancel(orderId);

		if (order.isConfirmed) {
			// TODO: return payment back and cancel shipping
		}

		this.log.info(
			{
				warehouseId: order.warehouseId,
				products: order.products,
			},
			'Order cancel add products back call'
		);

		// add products back to warehouse
		await this.warehousesProductsService.add(
			order.warehouseId,
			_.map(order.products, (orderProduct) => {
				return {
					product: orderProduct.product.id,
					count: orderProduct.count,
					price: orderProduct.price,
					initialPrice: orderProduct.initialPrice,
					deliveryTimeMin: orderProduct.deliveryTimeMin,
					deliveryTimeMax: orderProduct.deliveryTimeMax,
				};
			})
		);

		// revert order sold count
		await (<any>Bluebird).map(
			order.products,
			async (orderProduct: OrderProduct) => {
				const productId = orderProduct.product.id;

				await this.warehousesProductsService.decreaseSoldCount(
					order.warehouseId,
					productId,
					orderProduct.count
				);
			}
		);

		this.log.info(
			{
				warehouseId: order.warehouseId,
				products: order.products,
			},
			'Order cancel add products back call succeed'
		);

		return order;
	}

	/**
	 * Get Orders for given Store
	 *
	 * @param {string} storeId
	 * @param {IPagingOptions} pagingOptions
	 * @param {string} status
	 * @returns
	 * @memberof WarehousesOrdersService
	 */
	async getStoreOrders(
		storeId: string,
		pagingOptions: IPagingOptions,
		status: string
	) {
		const sortObj = {};

		const findObj = getStoreOrdersFingObj(storeId, status);

		if (pagingOptions.sort) {
			sortObj[pagingOptions.sort.field] = pagingOptions.sort.sortBy;
		}

		return this.ordersService.Model.find(findObj)
			.sort(sortObj)
			.skip(pagingOptions.skip)
			.limit(pagingOptions.limit)
			.lean()
			.exec();
	}

	private async _get(
		warehouseId: Warehouse['id'],
		options: {
			populateWarehouse?: boolean;
			populateCarrier?: boolean;
			onlyAvailableToCarrier?: boolean;
		} = {}
	): Promise<Order[]> {
		await this.warehousesService.throwIfNotExists(warehouseId);

		const findObj = { warehouse: warehouseId };

		if (options.onlyAvailableToCarrier) {
			_.extend(
				findObj,
				{
					carrierStatus: 0,
					$or: [
						{
							carrier: { $exists: false },
						},
						{
							carrier: null,
						},
					],
					warehouseStatus: { $gte: 2, $lt: 200 },
				},
				OrdersService.FindObjects.isCompleted
			);
		}

		let toPopulate = '';

		if (options.populateCarrier) {
			toPopulate += 'carrier ';
		}

		if (options.populateWarehouse) {
			toPopulate += 'warehouse ';
		}

		const orders = _.map(
			(await this.ordersService.Model.find({
				...findObj,
				isDeleted: { $eq: false },
			})
				.populate(toPopulate)
				.sort({
					_createdAt: -1, // Sort by Date Added DESC
				})
				.lean()
				.exec()) as IOrder[],
			(order) => new Order(order)
		);

		this.log.info(
			{
				warehouseId,
				orders,
			},
			'orders by warehouse (in getByWarehouse)'
		);

		return orders;
	}

	private async _getUser(userId: string): Promise<User> {
		const user = await this.usersService
			.get(userId)
			.pipe(first())
			.toPromise();

		if (user == null) {
			throw new Error(`There is no user with the id ${userId}`);
		}

		return user;
	}

	private async _getWarehouse(
		warehouseId: string
	): Promise<WithFullProducts> {
		const warehouse = (await this.warehousesService
			.get(warehouseId, true)
			.pipe(first())
			.toPromise()) as WithFullProducts;

		if (warehouse == null) {
			throw new Error(`There is no warehouse with the id ${warehouseId}`);
		}

		return warehouse;
	}

	private async _getOrderProducts(
		products,
		warehouseProducts
	): Promise<IOrderProductCreateObject[]> {
		return _.map(
			products,
			(args): IOrderProductCreateObject => {
				const wProduct = warehouseProducts[args.productId];
				if (!wProduct) {
					throw new Error(
						`WarehouseOrdersService got call to create(userId, orderProducts) - But there is no product with the id ${args.productId}!`
					);
				}
				return {
					count: args.count,
					comment: args.comment,
					price: wProduct.price,
					initialPrice: wProduct.initialPrice,
					deliveryTimeMin: wProduct.deliveryTimeMin,
					deliveryTimeMax: wProduct.deliveryTimeMax,
					product: wProduct.product as Product,
					isManufacturing: wProduct.isManufacturing,
					isCarrierRequired: wProduct.isCarrierRequired,
					isDeliveryRequired: wProduct.isDeliveryRequired,
					isTakeaway: wProduct.isTakeaway,
				};
			}
		);
	}

	private async _updateProductCount(order, warehouseId) {
		await (<any>Bluebird).map(
			order.products,
			async (orderProduct: OrderProduct) => {
				const productId = orderProduct.product.id;

				this.log.info(
					{
						warehouseId,
						productId,
						count: orderProduct.count,
					},
					'Order create remove products call'
				);

				await this.warehousesProductsService.decreaseCount(
					warehouseId,
					productId, // what product availability should be decreased
					orderProduct.count // how many to remove
				);

				await this.warehousesProductsService.increaseSoldCount(
					warehouseId,
					productId,
					orderProduct.count
				);

				this.log.info(
					{
						warehouseId,
						productId,
						count: orderProduct.count,
					},
					'Order create remove products call succeed'
				);
			}
		);
	}
}

export function getStoreOrdersFingObj(storeId: string, status: string) {
	const findObj = {
		isDeleted: { $eq: false },
		waitForCompletion: { $eq: false },
		warehouse: storeId,
	};

	switch (status) {
		case 'confirmed':
			findObj['$and'] = [
				{
					warehouseStatus: {
						$gt: OrderWarehouseStatus.NoStatus,
					},
				},
				{
					warehouseStatus: {
						$lt: OrderWarehouseStatus.GivenToCustomer,
					},
				},
				{
					carrierStatus: {
						$lte: OrderCarrierStatus.CarrierSelectedOrder,
					},
				},
			];
			findObj['isCancelled'] = false;
			break;
		case 'in_delivery':
			findObj['$and'] = [
				{
					carrierStatus: {
						$gte: OrderCarrierStatus.CarrierPickedUpOrder,
					},
				},
				{
					warehouseStatus: {
						$lt: OrderWarehouseStatus.AllocationFailed,
					},
				},
				{
					carrierStatus: {
						$lt: OrderCarrierStatus.DeliveryCompleted,
					},
				},
			];
			findObj['isCancelled'] = false;
			break;
		case 'not_confirmed':
			findObj['warehouseStatus'] = OrderWarehouseStatus.NoStatus;
			findObj['isCancelled'] = false;
			break;
		case 'alocation_started':
			findObj['warehouseStatus'] = OrderWarehouseStatus.AllocationStarted;
			findObj['isCancelled'] = false;
			break;
		case 'ready_for_packaging':
			findObj['warehouseStatus'] =
				OrderWarehouseStatus.AllocationFinished;
			findObj['isCancelled'] = false;
			break;
		case 'processing':
			findObj['warehouseStatus'] =
				OrderWarehouseStatus.WarehouseStartedProcessing;
			findObj['isCancelled'] = false;
			break;
		case 'packaging':
			findObj['warehouseStatus'] = OrderWarehouseStatus.PackagingStarted;
			findObj['isCancelled'] = false;
			break;
		case 'packaged':
			findObj['warehouseStatus'] = OrderWarehouseStatus.PackagingFinished;
			findObj['isCancelled'] = false;
			break;
		case 'not_paid':
			findObj['isPaid'] = false;
			break;
		case 'cancelled':
			findObj['isCancelled'] = true;
			break;
		case 'relevant':
			findObj['$and'] = [
				{
					warehouseStatus: {
						$gte: OrderWarehouseStatus.NoStatus,
					},
				},
				{
					warehouseStatus: {
						$lt: OrderWarehouseStatus.GivenToCustomer,
					},
				},
				{
					carrierStatus: {
						$lte: OrderCarrierStatus.CarrierSelectedOrder,
					},
				},
			];
			findObj['isCancelled'] = false;
			break;
		default:
			break;
	}

	return findObj;
}
