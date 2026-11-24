import Logger from 'bunyan';
import Bluebird from 'bluebird';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { env } from '../../env';
import { WarehousesService, WarehousesProductsService } from '../warehouses';
import { assertValidOrderProductCounts } from '../warehouses/orderProductCount';
import { toStripeAmountInCents } from './stripeAmount';
import { createEverLogger } from '../../helpers/Log';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { UsersService } from '../users';
import Order from '@modules/server.common/entities/Order';
import { DBService, ExistenceEventType } from '@pyro/db-server';
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
import { Stripe } from 'stripe'
import {
	assertCarrierStatusTransition,
	assertOrderCanBeCancelled,
	assertOrderProductsCanChange,
	assertWarehouseStatusTransition,
	cancellableOrderFilter,
	notCancelledOrderFilter,
} from './orderStatusTransitions';
import { orderCompletionFilters } from './orderCompletionFilters';
import { findOrderProductForComment } from './orderProductComment';

/**
 * A cancelled order was put back in stock and may be refunded:
 * it must not become delivered or paid afterwards.
 */
function orderIsCancelledError(orderId: string): Error {
	return new Error(
		`Order ${orderId} is cancelled, so its status can not change!`
	);
}

/**
 * Stock of an order is only ever taken from or put back into the store of the order.
 */
function assertOrderStore(order: Order, warehouseId: Warehouse['id']): void {
	if (warehouseId !== order.warehouseId) {
		throw new Error(
			`Order ${order.id} belongs to another store, not to the store ${warehouseId}!`
		);
	}
}

@injectable()
@routerName('order')
export class OrdersService extends DBService<Order>
	implements IOrderRouter, IService {
	public readonly DBObject: any = Order;

	// TODO: this and other Stripe related things should be inside separate Payments Service
	private stripe: Stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		apiVersion: "2020-08-27"
	});

	protected readonly log: Logger = createEverLogger({
		name: 'ordersService',
	});

	static readonly FindObjects = orderCompletionFilters;

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
		await this._throwIfNotExists(orderId);

		// Not every status can follow any other: e.g. an order in status 3 cannot move back to status 2
		const currentOrder = await this._get(orderId);

		if (currentOrder.isCancelled) {
			throw orderIsCancelledError(orderId);
		}

		const currentStatus =
			currentOrder.carrierStatus ?? OrderCarrierStatus.NoCarrier;
		assertCarrierStatusTransition(currentStatus, status);

		if (currentStatus === status) {
			// idempotent retry: nothing to write and no side effects to repeat
			return currentOrder;
		}

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
				// Nothing is left to deliver: no time estimate either.
				updateObj.deliveryTimeEstimate = 0;
			}

			// Matches nothing when a cancel landed after the check above
			const order = await this._updateIfMatches(
				orderId,
				notCancelledOrderFilter,
				updateObj
			);

			if (order == null) {
				throw orderIsCancelledError(orderId);
			}

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

		const currentOrder = await this._get(orderId);

		if (currentOrder.isCancelled) {
			throw orderIsCancelledError(orderId);
		}

		const currentStatus =
			currentOrder.warehouseStatus ?? OrderWarehouseStatus.NoStatus;
		assertWarehouseStatusTransition(currentStatus, status);

		if (currentStatus === status) {
			// idempotent retry: nothing to write and no side effects to repeat
			return currentOrder;
		}

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

		// Matches nothing when a cancel landed after the check above
		const order = await this._updateIfMatches(
			orderId,
			notCancelledOrderFilter,
			updateObj
		);

		if (order == null) {
			throw orderIsCancelledError(orderId);
		}

		return order;
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

				// A double tap or a retry must not charge the customer again,
				// and a cancelled order must not be charged at all.
				if (order.isPaid) {
					throw new Error('Order is already paid');
				}

				if (order.isCancelled) {
					throw new Error('Order is cancelled and can not be paid');
				}

				const user = await this.usersService
					.get(order.user.id)
					.pipe(first())
					.toPromise();

				if (user != null) {
					const charge: Stripe.Charge = await this.stripe.charges.create(
						{
							amount: toStripeAmountInCents(order.totalPrice), // whole cents
							customer: user.stripeCustomerId,
							source: cardId,
							currency: 'ils',
							description: 'Order id: ' + orderId,
							metadata: {
								orderId,
							},
						},
						{
							// Two concurrent calls for one order and card
							// create a single charge.
							idempotencyKey: `order-${orderId}-card-${cardId}`,
						}
					);

					// Matches nothing when a cancel landed while Stripe was
					// charging: a cancelled order must not become paid.
					const paidOrder = await this._updateIfMatches(
						orderId,
						notCancelledOrderFilter,
						{
							stripeChargeId: charge.id,
							isPaid: true,
						}
					);

					if (paidOrder == null) {
						const chargeId = charge.id;

						this.log.warn(
							{ callId, orderId, chargeId },
							'.payWithStripe(orderId, cardId) order was cancelled during the charge, refunding it'
						);

						// Keep the charge traceable, so refundWithStripe can
						// retry when the refund below fails.
						try {
							await this.update(orderId, {
								stripeChargeId: chargeId,
							});
						} catch (err) {
							this.log.error(
								{ callId, orderId, chargeId, err },
								'.payWithStripe(orderId, cardId) could not store the charge of a cancelled order'
							);
						}

						try {
							await this.stripe.refunds.create(
								{ charge: chargeId },
								{
									idempotencyKey: `refund-order-${orderId}-charge-${chargeId}`,
								}
							);
						} catch (err) {
							// refundWithStripe from the app may have refunded
							// this charge first: the money is back already.
							if (
								err != null &&
								err.code === 'charge_already_refunded'
							) {
								this.log.info(
									{ callId, orderId, chargeId, err },
									'.payWithStripe(orderId, cardId) the charge of a cancelled order was already refunded'
								);
							} else {
								this.log.error(
									{ callId, orderId, chargeId, err },
									'.payWithStripe(orderId, cardId) could not refund the charge of a cancelled order'
								);
							}
						}

						throw orderIsCancelledError(orderId);
					}

					order = paidOrder;
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
	 * Refund money for cancelled order via Stripe.
	 * Refuses orders that are not cancelled, and orders that were delivered
	 * (carrier DeliveryCompleted or warehouse GivenToCustomer). Issue and
	 * refusal statuses stay refundable once the order is cancelled.
	 * A charge Stripe reports as already refunded resolves with the order,
	 * so a repeated cancel still completes; any other Stripe error rejects.
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

		let refund: Stripe.Refund;
		let order: Order | null;

		try {
			order = await this.get(orderId).pipe(first()).toPromise();

			if (order != null) {
				if (!order.isCancelled) {
					throw new Error(
						`Order ${orderId} is not cancelled, so it cannot be refunded`
					);
				}

				if (
					order.carrierStatus ===
						OrderCarrierStatus.DeliveryCompleted ||
					order.warehouseStatus ===
						OrderWarehouseStatus.GivenToCustomer
				) {
					throw new Error(
						`Order ${orderId} was delivered to the customer, so it cannot be refunded`
					);
				}

				if (order.stripeChargeId != null) {
					const chargeId = order.stripeChargeId;

					try {
						refund = await this.stripe.refunds.create({
							charge: chargeId,
						});
					} catch (err) {
						// A repeated cancel (double tap, a lost reply) or
						// payWithStripe refunded this charge before: the
						// customer has the money back, so the cancel is done.
						if (
							err != null &&
							err.code === 'charge_already_refunded'
						) {
							this.log.info(
								{ callId, orderId, chargeId, err },
								'.refundWithStripe(orderId) charge was already refunded'
							);
							return order;
						}

						throw err;
					}

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

	/**
	 * Confirms the order: it becomes ReadyForProcessing for the store.
	 * Only an order the store has not started yet (NoStatus or already
	 * ReadyForProcessing) can be confirmed. This listener is public, so
	 * it must never move an order the store already works on, or handed over,
	 * back to ReadyForProcessing: such an order could be cancelled, restocked
	 * and refunded again.
	 *
	 * @returns the confirmed order, unchanged when it was confirmed already
	 * @throws when the order is cancelled or already past ReadyForProcessing,
	 * also when that happened after the first check
	 */
	@asyncListener()
	async confirm(orderId: Order['id']): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const currentOrder = await this._get(orderId);

		if (currentOrder.isCancelled) {
			throw orderIsCancelledError(orderId);
		}

		const currentStatus =
			currentOrder.warehouseStatus ?? OrderWarehouseStatus.NoStatus;

		if (
			currentOrder.isConfirmed &&
			currentStatus === OrderWarehouseStatus.ReadyForProcessing
		) {
			// The apps confirm again after the payment: nothing to write
			return currentOrder;
		}

		assertWarehouseStatusTransition(
			currentStatus,
			OrderWarehouseStatus.ReadyForProcessing
		);

		// Matches nothing when a cancel or a store status change landed after the checks above
		const order = await this._updateIfMatches(
			orderId,
			{
				...notCancelledOrderFilter,
				warehouseStatus: {
					$in: [
						OrderWarehouseStatus.NoStatus,
						OrderWarehouseStatus.ReadyForProcessing,
						null,
					],
				},
			},
			{
				isConfirmed: true,
				warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
			}
		);

		if (order == null) {
			const latestOrder = await this._get(orderId);

			if (latestOrder.isCancelled) {
				throw orderIsCancelledError(orderId);
			}

			assertWarehouseStatusTransition(
				latestOrder.warehouseStatus ?? OrderWarehouseStatus.NoStatus,
				OrderWarehouseStatus.ReadyForProcessing
			);

			throw new Error(`Order ${orderId} could not be confirmed!`);
		}

		return order;
	}

	@asyncListener()
	async addProducts(
		orderId: Order['id'],
		products,
		warehouseId: Warehouse['id']
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		assertValidOrderProductCounts(products);

		const order = await this._get(orderId);

		assertOrderProductsCanChange(order);
		assertOrderStore(order, warehouseId);

		const oldProductsIds = order.products.map(
			(p: OrderProduct) => p.product.id
		);
		const newProductsIds = products.map((p) => p.productId);

		const addedProducts = products.filter(
			(p: { [x: string]: string }) =>
				!oldProductsIds.includes(p['productId'])
		);

		// Build the new lines before any stock write: a product the store
		// does not sell throws here and leaves the stock untouched
		const warehouse = (await this.warehousesService
			.get(order.warehouseId, true)
			.pipe(first())
			.toPromise()) as WithFullProducts;

		const warehouseProducts = _.keyBy(warehouse.products, 'productId');

		const newOrderProducts = _.map(
			addedProducts,
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

		for (const product of order.products) {
			if (newProductsIds.includes(product.product.id)) {
				const newProduct = products.find(
					(p: { productId: string }) =>
						p.productId === product.product.id
				);

				if (newProduct) {
					product.count += newProduct.count;

					await this.warehousesProductsService.decreaseCount(
						order.warehouseId,
						newProduct.productId, // what product availability should be decreased
						newProduct.count // how many to remove
					);

					await this.warehousesProductsService.increaseSoldCount(
						order.warehouseId,
						newProduct.productId,
						newProduct.count
					);
				}
			}
		}

		for (const product of addedProducts) {
			await this.warehousesProductsService.decreaseCount(
				order.warehouseId,
				product.productId,
				product.count
			);

			await this.warehousesProductsService.increaseSoldCount(
				order.warehouseId,
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

		assertValidOrderProductCounts(products);

		const order = await this._get(orderId);

		assertOrderProductsCanChange(order);
		assertOrderStore(order, warehouseId);

		// Check every line before any stock write: a refused line must not
		// leave the earlier lines restocked while the order stays the same
		const decreases = new Map<
			string,
			{ orderProduct: OrderProduct; count: number }
		>();

		for (const { productId, count } of products) {
			const orderProduct = order.products.find(
				(p: OrderProduct) => p.product.id === productId
			);

			if (!orderProduct) {
				throw new Error(
					`Order ${orderId} has no product with the id ${productId}!`
				);
			}

			const decrease = decreases.has(productId)
				? decreases.get(productId).count + count
				: count;

			if (orderProduct.count - decrease < 1) {
				throw new Error(`You can not decrease product to be === 0 !`);
			}

			decreases.set(productId, { orderProduct, count: decrease });
		}

		for (const [productId, { orderProduct, count }] of decreases) {
			orderProduct.count -= count;

			await this.warehousesProductsService.decreaseSoldCount(
				order.warehouseId,
				productId,
				count
			);

			await this.warehousesProductsService.increaseCount(
				order.warehouseId,
				productId,
				count
			);
		}

		return this.update(orderId, {
			products: order.products,
		});
	}

	@asyncListener()
	async removeProducts(
		orderId: Order['id'],
		productsIds: string[]
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const order = await this._get(orderId);

		// A cancelled or handed over order must not put its products back into stock again
		assertOrderProductsCanChange(order);

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
	async addProductComment(
		orderId: Order['id'],
		productId: string,
		comment: string
	): Promise<Order> {
		await this._throwIfNotExists(orderId);

		const order = await this._get(orderId);
		// Throws a clear error for an unknown line or a bad comment, instead of
		// a TypeError on `undefined`
		const orderProduct = findOrderProductForComment(
			order,
			productId,
			comment
		);

		orderProduct.comment = comment;

		await this.update(orderId, {
			products: order.products,
		});

		return this.get(orderId, {
			populateWarehouse: true,
			populateCarrier: true,
		})
			.pipe(first())
			.toPromise();
	}

	/**
	 * Cancels the order with one conditional write that matches only an order
	 * that is not cancelled and not given to the customer yet.
	 *
	 * @returns the cancelled order, or null when another cancel got there
	 * first (nothing written, so the caller must not restock again)
	 * @throws when the order was given to the customer, also when that
	 * happened after the first check
	 */
	@asyncListener()
	async cancel(orderId: Order['id']): Promise<Order | null> {
		await this._throwIfNotExists(orderId);

		// A delivered order must stay delivered: this listener is public too
		assertOrderCanBeCancelled(await this._get(orderId));

		const cancelled = await this._updateIfMatches(
			orderId,
			cancellableOrderFilter,
			{
				isCancelled: true,
				finishedProcessingTime: Date.now(),
			}
		);

		if (cancelled == null) {
			// Delivered after the check above, or cancelled by another call
			assertOrderCanBeCancelled(await this._get(orderId));
		}

		return cancelled;
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

		if ((await this._get(orderId)).isCancelled) {
			throw orderIsCancelledError(orderId);
		}

		// Matches nothing when a cancel landed after the check above
		const order = await this._updateIfMatches(
			orderId,
			notCancelledOrderFilter,
			{ isPaid: true }
		);

		if (order == null) {
			throw orderIsCancelledError(orderId);
		}

		return order;
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
		const query = this.Model.findById(id);
		if (options.populateCarrier) {
			query.populate('carrier');
		}
		if (options.populateWarehouse) {
			query.populate('warehouse');
		}
		return new Order(
			(
				await query
					.sort({ _createdAt: -1, orderNumber: -1 })
					.lean()
					.exec()
			) as IOrder
		);
	}

	/**
	 * Writes `updateObj` only while the order still matches `conditions`, in
	 * one atomic findOneAndUpdate, and emits the same update event as `update`.
	 *
	 * @returns the updated order, or null when the order did not match
	 * (nothing written)
	 */
	private async _updateIfMatches(
		orderId: Order['id'],
		conditions: object,
		updateObj: any
	): Promise<Order | null> {
		const lastValue = await this.getCurrent(orderId);

		const raw = (await this.Model.findOneAndUpdate(
			{ _id: orderId, ...conditions },
			updateObj,
			{ new: true }
		)
			.lean()
			.exec()) as IOrder | null;

		if (raw == null) {
			return null;
		}

		const order = new Order(raw);

		this.existence.next({
			id: orderId,
			value: order,
			lastValue,
			type: ExistenceEventType.Updated,
		});

		return order;
	}

	private async _throwIfNotExists(orderId: string): Promise<void> {
		const order = await super.get(orderId).pipe(first()).toPromise();

		if (!order || order.isDeleted) {
			throw Error(`Order with id '${orderId}' does not exists!`);
		}
	}
}
