import Logger from 'bunyan';
import Bluebird from 'bluebird';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { env } from '../../env';
import { WarehousesService, WarehousesProductsService } from '../warehouses';
import { createEverLogger } from '../../helpers/Log';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { UsersService } from '../users';
import Order from '@modules/server.common/entities/Order';
import { DBService } from '@pyro/db-server';
import {
	default as IOrder,
	IOrderCreateObject,
} from '@modules/server.common/interfaces/IOrder';
import CarriersService from '../carriers/CarriersService';
import IOrderRouter from '@modules/server.common/routers/IOrderRouter';
import { asyncListener, observableListener, routerName } from '@pyro/io';
import IService from '../IService';
import { exhaustMap, first, switchMap, map } from 'rxjs/operators';
import { v1 as uuid } from 'uuid';
import OrderProduct from '@modules/server.common/entities/OrderProduct';
import { IOrderProductCreateObject } from '@modules/server.common/interfaces/IOrderProduct';
import _ = require('lodash');
import Product from '@modules/server.common/entities/Product';
import Warehouse, {
	WithFullProducts,
} from '@modules/server.common/entities/Warehouse';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import User from '@modules/server.common/entities/User';
import { ProductsService } from '../../services/products';
import { Observable } from 'rxjs';
import Stripe = require('stripe');

@injectable()
@routerName('order')
export class OrdersService extends DBService<Order>
	implements IOrderRouter, IService {
	public readonly DBObject: any = Order;

	// TODO: this and other Stripe related things should be inside separate Payments Service
	private stripe: Stripe = new Stripe(env.STRIPE_SECRET_KEY);

	protected readonly log: Logger = createEverLogger({
		name: 'ordersService',
	});

	static readonly FindObjects = {
		isCompleted: {
			$or: [
				{
					isPaid: true,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				},
				{
					isCancelled: true,
				},
			],
		},
		isNotCompleted: {
			$and: [
				{
					isPaid: false,
					carrierStatus: {
						$ne: OrderCarrierStatus.DeliveryCompleted,
					},
				},
				{
					isCancelled: false,
				},
			],
		},
	};

	constructor(
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		protected warehousesService: WarehousesService,
		@inject(new LazyServiceIdentifer(() => UsersService))
		protected usersService: UsersService,
		@inject(new LazyServiceIdentifer(() => CarriersService))
		protected carriersService: CarriersService,
		@inject(new LazyServiceIdentifer(() => WarehousesProductsService))
		protected warehousesProductsService: WarehousesProductsService,
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		protected _storesService: WarehousesService,
		@inject(new LazyServiceIdentifer(() => ProductsService))
		protected _productsService: ProductsService
	) {
		super();
	}

	async generateOrdersPerEachCustomer(customers: any[]): Promise<void> {
		const stores = await this._storesService.findAll({
			_id: 1,
			products: 1,
		});

		const products = await this._productsService.findAll();

		const orders: IOrderCreateObject[] = [];

		customers.forEach((customer, index) => {
			const storeId = stores[index % stores.length]._id;
			const product1Price = Math.round(Math.random() * 99);
			const product2Price = Math.round(Math.random() * 99);

			orders.push({
				products: [
					{
						count: 2,
						isManufacturing: true,
						isCarrierRequired: true,
						isDeliveryRequired: true,
						price: product1Price,
						initialPrice: product1Price,
						product: products[index % products.length],
					},
					{
						count: 2,
						isManufacturing: true,
						isCarrierRequired: true,
						isDeliveryRequired: true,
						price: product2Price,
						initialPrice: product2Price,
						product: products[(index + 1) % products.length],
					},
				],
				user: customer,
				warehouse: storeId,
				orderNumber: index,
			});
		});

		await this.Model.insertMany(orders);
	}

	@observableListener()
	get(
		id: Order['id'],
		options: { populateWarehouse?: boolean; populateCarrier?: boolean } = {}
	): Observable<Order> {
		if (options.populateCarrier || options.populateWarehouse) {
			return super.get(id).pipe(
				map(async (order) => {
					await this._throwIfNotExists(id);
					return order;
				}),
				switchMap((order) => order),
				exhaustMap(() => this._get(id, options))
			);
		} else {
			return super.get(id).pipe(
				map(async (order) => {
					await this._throwIfNotExists(id);
					return order;
				}),
				switchMap((order) => order)
			);
		}
	}

	@asyncListener()
	async updateCarrierStatus(
		orderId: Order['id'],
		status: OrderCarrierStatus
	): Promise<Order> {
		// TODO: check here that not from any status it is possible to move to any other.
		// Mean if order is status 3, it's not simply possible to update it to status 2.
		await this._throwIfNotExists(orderId);

		try {
			const updateObj: any = { carrierStatus: status };

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

			const order = await this.update(orderId, updateObj);

			if (order.carrierId != null) {
				if (status === OrderCarrierStatus.DeliveryCompleted) {
					await this.carriersService.increaseNumberOfDeliveries(
						order.carrierId,
						1
					);
				}

				return order;
			} else {
				throw new Error(
					"Can't updateCarrierStatus(orderId, status) - Order has no carrier!"
				);
			}
		} catch (err) {
			this.log.error(err);
			throw err;
		}
	}

	@asyncListener()
	async updateWarehouseStatus(
		orderId: Order['id'],
		status: OrderWarehouseStatus
	): Promise<Order> {
		await this._throwIfNotExists(orderId);
		const updateObj: any = { warehouseStatus: status };
		const finishedProcessingStatuses = [
			OrderWarehouseStatus.PackagingFailed,
			OrderWarehouseStatus.AllocationFailed,
		];
		if (finishedProcessingStatuses.includes(status)) {
			updateObj.finishedProcessingTime = Date.now();
		}
		if (status === OrderWarehouseStatus.GivenToCustomer) {
			updateObj.isPaid = true;
			updateObj.finishedProcessingTime = Date.now();
		}
		return this.update(orderId, updateObj);
	}

	/**
	 * Pay with Stripe for given order with given CC
	 * TODO: move to separate Payments Service
	 *
	 * @param {Order['id']} orderId
	 * @param {string} cardId CC Id which will be used to pay
	 * @returns {Promise<Order>}
	 * @memberof OrdersService
	 */
	@asyncListener()
	async payWithStripe(orderId: Order['id'], cardId: string): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const callId = uuid();

		this.log.info(
			{ callId, orderId, cardId },
			'.payWithStripe(orderId, cardId) called'
		);

		let order: Order;

		try {
			const _order = await this.get(orderId).pipe(first()).toPromise();

			if (_order != null) {
				order = _order;

				const user = await this.usersService
					.get(order.user.id)
					.pipe(first())
					.toPromise();

				if (user != null) {
					const charge: Stripe.charges.ICharge = await this.stripe.charges.create(
						{
							amount: order.totalPrice * 100, // amount in cents, again
							customer: user.stripeCustomerId,
							source: cardId,
							currency: 'ils',
							description: 'Order id: ' + orderId,
							metadata: {
								orderId,
							},
						}
					);

					order = await this.update(orderId, {
						stripeChargeId: charge.id,
						isPaid: true,
					});
				} else {
					throw new Error('User specified in order is not found!');
				}
			} else {
				throw new Error("couldn't find order with such id");
			}
		} catch (err) {
			this.log.error(
				{ callId, orderId, cardId, err },
				'.payWithStripe(orderId, cardId) thrown error!'
			);
			throw err;
		}

		this.log.info(
			{ callId, orderId, cardId, order },
			'.payWithStripe(orderId, cardId) accepted payment'
		);

		return order;
	}

	/**
	 * Refund money for cancelled order via Stripe
	 * TODO: move to Payments Service
	 *
	 * @param {Order['id']} orderId
	 * @returns {Promise<Order>}
	 * @memberof OrdersService
	 */
	@asyncListener()
	async refundWithStripe(orderId: Order['id']): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const callId = uuid();

		this.log.info({ callId, orderId }, '.refundWithStripe(orderId) called');

		let refund: Stripe.refunds.IRefund;
		let order: Order | null;

		try {
			order = await this.get(orderId).pipe(first()).toPromise();

			if (order != null) {
				if (order.stripeChargeId != null) {
					refund = await this.stripe.refunds.create({
						charge: order.stripeChargeId,
					});

					this.log.info(
						{ callId, orderId, refund },
						'.refundWithStripe(orderId) made refund'
					);
					return order;
				} else {
					throw new Error(
						`There is no order with stripeChargeId field and id of ${orderId} to refundWithStripe on!`
					);
				}
			} else {
				throw new Error(
					`There is no order with id of ${orderId} to refundWithStripe on!`
				);
			}
		} catch (err) {
			this.log.error(
				{ callId, orderId, err },
				'.refundWithStripe(orderId) thrown error!'
			);
			throw err;
		}
	}

	@asyncListener()
	async confirm(orderId: Order['id']): Promise<Order> {
		await this._throwIfNotExists(orderId);

		return this.update(orderId, {
			isConfirmed: true,
			warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
		});
	}

	@asyncListener()
	async addProducts(
		orderId: Order['id'],
		products,
		warehouseId: Warehouse['id']
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const order = await this._get(orderId);
		const oldProductsIds = order.products.map(
			(p: OrderProduct) => p.product.id
		);
		const newProductsIds = products.map((p) => p.productId);

		for (const product of order.products) {
			if (newProductsIds.includes(product.product.id)) {
				const newProduct = products.find(
					(p: { productId: string }) =>
						p.productId === product.product.id
				);

				if (newProduct) {
					product.count += newProduct.count;

					await this.warehousesProductsService.decreaseCount(
						warehouseId,
						newProduct.productId, // what product availability should be decreased
						newProduct.count // how many to remove
					);

					await this.warehousesProductsService.increaseSoldCount(
						warehouseId,
						newProduct.productId,
						newProduct.count
					);
				}
			}
		}

		products = products.filter(
			(p: { [x: string]: string }) =>
				!oldProductsIds.includes(p['productId'])
		);

		const warehouse = (await this.warehousesService
			.get(warehouseId, true)
			.pipe(first())
			.toPromise()) as WithFullProducts;

		const warehouseProducts = _.keyBy(warehouse.products, 'productId');

		const newOrderProducts = await _.map(
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

		for (const product of products) {
			await this.warehousesProductsService.decreaseCount(
				warehouseId,
				product.productId,
				product.count
			);

			await this.warehousesProductsService.increaseSoldCount(
				warehouseId,
				product.productId,
				product.count
			);
		}

		return this.update(orderId, {
			products: [...order.products, ...newOrderProducts],
		});
	}

	@asyncListener()
	async decreaseOrderProducts(
		orderId: Order['id'],
		products: any, // TODO: specify correct Type
		warehouseId: Warehouse['id']
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const order = await this._get(orderId);

		const oldProductsIds = order.products.map(
			(p: OrderProduct) => p.product.id
		);

		const newProductsIds = products.map((p) => p.productId);

		for (const product of order.products) {
			if (newProductsIds.includes(product.product.id)) {
				const newProduct = products.find(
					(p: { productId: string }) =>
						p.productId === product.product.id
				);

				if (newProduct) {
					product.count -= newProduct.count;
					if (product.count >= 1) {
						await this.warehousesProductsService.decreaseSoldCount(
							warehouseId,
							// what product availability should be decreased
							newProduct.productId,
							// how many to remove
							newProduct.count
						);

						await this.warehousesProductsService.increaseCount(
							warehouseId,
							newProduct.productId,
							newProduct.count
						);
					} else {
						throw new Error(
							`You can not decrease product to be === 0 !`
						);
					}
				}
			}
		}

		products = products.filter(
			(p: { [x: string]: string }) =>
				!oldProductsIds.includes(p['productId'])
		);

		const warehouse = (await this.warehousesService
			.get(warehouseId, true)
			.pipe(first())
			.toPromise()) as WithFullProducts;

		const warehouseProducts = _.keyBy(warehouse.products, 'productId');

		const newOrderProducts = await _.map(
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

		for (const product of products) {
			await this.warehousesProductsService.decreaseCount(
				warehouseId,
				product.productId,
				product.count
			);

			await this.warehousesProductsService.increaseSoldCount(
				warehouseId,
				product.productId,
				product.count
			);
		}

		return this.update(orderId, {
			products: [...order.products, ...newOrderProducts],
		});
	}

	@asyncListener()
	async removeProducts(
		orderId: Order['id'],
		productsIds: string[]
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const order = await this._get(orderId);

		const newProducts = order.products.filter(
			(p: OrderProduct) => !productsIds.includes(p.product.id)
		);

		const removedProducts = order.products.filter((p: OrderProduct) =>
			productsIds.includes(p.product.id)
		);

		// revert order sold count
		await (<any>Bluebird).map(removedProducts, async (orderProduct) => {
			const productId = orderProduct.product.id;

			await this.warehousesProductsService.decreaseSoldCount(
				order.warehouseId,
				productId,
				orderProduct.count
			);

			await this.warehousesProductsService.increaseCount(
				order.warehouseId,
				productId,
				orderProduct.count
			);
		});

		return this.update(orderId, {
			products: newProducts,
		});
	}

	@asyncListener()
	async cancel(orderId: Order['id']): Promise<Order> {
		await this._throwIfNotExists(orderId);

		return this.update(orderId, {
			isCancelled: true,
			finishedProcessingTime: Date.now(),
		});
	}

	/**
	 * Set order with given Id as Paid
	 *
	 * @param {Order['id']} orderId
	 * @returns {Promise<Order>}
	 * @memberof OrdersService
	 */
	@asyncListener()
	async paid(orderId: Order['id']): Promise<Order> {
		await this._throwIfNotExists(orderId);

		return this.update(orderId, { isPaid: true });
	}

	@asyncListener()
	async getStoreOrdersChartTotalOrders(storeId: string): Promise<any> {
		const ordersRaw = await this.Model.find({
			warehouse: storeId,
			isDeleted: { $eq: false },
		})
			.select({
				isCancelled: 1,
				isPaid: 1,
				carrier: 1,
				carrierStatus: 1,
				warehouseStatus: 1,
				_createdAt: 1,
				'products.price': 1,
				'products.count': 1,
			})
			.lean()
			.exec();

		const orders = _.map(ordersRaw, (o) => {
			return {
				totalPrice: this._getOrderTotalPrice(o),
				isCompleted: this._isOrderCompleted(o),
				isCancelled: o.isCancelled,
				_createdAt: o._createdAt,
			};
		});

		return orders.filter((o) => o.isCompleted);
	}

	@asyncListener()
	async getOrdersChartTotalOrders(): Promise<any> {
		const ordersRaw = await this.Model.find({
			isDeleted: { $eq: false },
		})
			.select({
				isCancelled: 1,
				isPaid: 1,
				carrier: 1,
				carrierStatus: 1,
				warehouseStatus: 1,
				_createdAt: 1,
				'products.price': 1,
				'products.count': 1,
			})
			.lean()
			.exec();

		const orders = _.map(ordersRaw, (o) => {
			return {
				totalPrice: this._getOrderTotalPrice(o),
				isCompleted: this._isOrderCompleted(o),
				isCancelled: o.isCancelled,
				_createdAt: o._createdAt,
			};
		});

		const ordersRes = orders.filter((o) => o.isCompleted);

		return ordersRes;
	}

	@asyncListener()
	async getDashboardCompletedOrdersToday(): Promise<any> {
		const start = new Date();
		const end = new Date();

		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);

		const ordersRaw = await this.Model.find({
			isDeleted: { $eq: false },
			isCancelled: { $eq: false },
			_createdAt: { $gte: start, $lt: end },
		})
			.select({
				isCancelled: 1,
				isPaid: 1,
				carrier: 1,
				carrierStatus: 1,
				warehouseStatus: 1,
				_createdAt: 1,
				warehouse: 1,
				user: 1,
				'products.price': 1,
				'products.count': 1,
			})
			.lean()
			.exec();

		const orders = _.map(ordersRaw, (o) => {
			return {
				totalPrice: this._getOrderTotalPrice(o),
				isCompleted: this._isOrderCompleted(o),
				isCancelled: o.isCancelled,
				user: o.user,
				warehouseId: o.warehouse,
				_createdAt: o._createdAt,
			};
		});

		return orders.filter((o) => o.isCompleted);
	}

	@asyncListener()
	async getOrderedUsersInfo(storeId: string): Promise<any> {
		const orders = await this.Model.find({
			isDeleted: { $eq: false },
			warehouse: { $eq: storeId },
		})
			.select({
				user: 1,
				isPaid: 1,
				'products.price': 1,
				'products.count': 1,
			})
			.lean()
			.exec();

		const unique = (value, index, self) => {
			return (
				self
					.map((s) => s.user._id.toString())
					.indexOf(value.user._id.toString()) === index
			);
		};

		const oUsers = orders.filter(unique).map((o) => {
			const user: User = new User(o.user);
			return user;
		});

		const oUserIds = oUsers.map((u) => u.id);
		const realUsers = await this.usersService.find({
			isDeleted: false,
			_id: { $in: oUserIds },
		});

		return oUsers.map((u) => {
			const userOrders = orders.filter(
				(o) => o.user._id.toString() === u._id.toString()
			);

			let totalPrice = 0;

			const paidOrders = userOrders.filter((o: Order) => o.isPaid);

			if (paidOrders.length > 0) {
				totalPrice = paidOrders
					.map((o: Order) => this._getOrderTotalPrice(o))
					.reduce((a, b) => a + b);
			}

			return {
				user: realUsers.find((ru) => ru.id === u.id),
				ordersCount: userOrders.length,
				totalPrice,
			};
		});
	}

	@asyncListener()
	async getDashboardCompletedOrders(storeId?: string): Promise<any> {
		const quaryObj = {
			isDeleted: { $eq: false },
			isCancelled: { $eq: false },
		};

		if (storeId) {
			quaryObj['warehouse'] = { $eq: storeId };
		}

		const ordersRaw = await this.Model.find(quaryObj)
			.select({
				isCancelled: 1,
				isPaid: 1,
				carrier: 1,
				// user: 1,
				carrierStatus: 1,
				warehouseStatus: 1,
				// _createdAt: 1,
				warehouse: 1,
				'products.price': 1,
				'products.count': 1,
			})
			.lean()
			.exec();

		const orders = _.map(ordersRaw, (o) => {
			return {
				totalPrice: this._getOrderTotalPrice(o),
				warehouseId: o.warehouse,
				isCompleted: this._isOrderCompleted(o),
				// isCancelled: o.isCancelled,
				// user: o.user,
				// _createdAt: o._createdAt
			};
		});

		return orders.filter((o) => o.isCompleted);
	}

	@asyncListener()
	async getOrdersInDelivery(storeId: string): Promise<Order[]> {
		const order = await this.Model.find({
			isDeleted: false,
			isCancelled: false,
			warehouse: storeId,
			carrierStatus: {
				$in: [
					OrderCarrierStatus.CarrierPickedUpOrder,
					OrderCarrierStatus.CarrierStartDelivery,
					OrderCarrierStatus.CarrierArrivedToCustomer,
				],
			},
		})
			.populate('carrier user')
			.lean()
			.exec();

		return order;
	}

	private _getOrderTotalPrice(order: Order): number {
		return _.sum(_.map(order.products, (p) => p.count * p.price));
	}

	private _isOrderCompleted(order: Order): boolean {
		function getStatus(o: Order): OrderStatus {
			if (
				o.carrier == null ||
				o.carrierStatus <= OrderCarrierStatus.CarrierPickedUpOrder
			) {
				if (o.warehouseStatus >= 200) {
					return OrderStatus.WarehouseIssue;
				} else if (o.isCancelled) {
					return OrderStatus.CanceledWhileWarehousePreparation;
				} else {
					return OrderStatus.WarehousePreparation;
				}
			} else {
				if (o.carrierStatus >= 200) {
					return OrderStatus.CarrierIssue;
				} else if (o.isCancelled) {
					return OrderStatus.CanceledWhileInDelivery;
				} else if (
					o.isPaid &&
					o.carrierStatus === OrderCarrierStatus.DeliveryCompleted
				) {
					return OrderStatus.Delivered;
				} else {
					return OrderStatus.InDelivery;
				}
			}
		}
		return (
			(order.isPaid && getStatus(order) === OrderStatus.Delivered) ||
			order.isCancelled
		);
	}

	private async _get(
		id: string,
		options: { populateWarehouse?: boolean; populateCarrier?: boolean } = {}
	): Promise<Order> {
		let toPopulate = '';

		if (options.populateCarrier) {
			toPopulate += 'carrier ';
		}

		if (options.populateWarehouse) {
			toPopulate += 'warehouse ';
		}

		return new Order(
			(await this.Model.findById(id)
				.populate(toPopulate)
				.sort({ _createdAt: -1, orderNumber: -1 })
				.lean()
				.exec()) as IOrder
		);
	}

	private async _throwIfNotExists(orderId: string): Promise<void> {
		const order = await super.get(orderId).pipe(first()).toPromise();

		if (!order || order.isDeleted) {
			throw Error(`Order with id '${orderId}' does not exists!`);
		}
	}
}
