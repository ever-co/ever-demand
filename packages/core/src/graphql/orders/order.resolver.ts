import { Query, ResolveProperty, Resolver, Mutation } from '@nestjs/graphql';
import IOrder from '@modules/server.common/interfaces/IOrder';
import CarriersService from '../../services/carriers/CarriersService';
import Order from '@modules/server.common/entities/Order';
import { first } from 'rxjs/operators';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import Warehouse from '@modules/server.common/entities/Warehouse';
import User from '@modules/server.common/entities/User';
import Carrier from '@modules/server.common/entities/Carrier';
import { WarehousesService } from '../../services/warehouses';
import { OrdersService } from '../../services/orders';
import { UsersService } from '../../services/users';
import IProduct from '@modules/server.common/interfaces/IProduct';
import { ProductsService } from '../../services/products';
import Product from '@modules/server.common/entities/Product';
import _ from 'lodash';
import { ObjectId } from 'bson';
import { FakeOrdersService } from '../../services/fake-data/FakeOrdersService';

@Resolver('Order')
export class OrderResolver {
	constructor(
		private readonly _ordersService: OrdersService,
		private readonly _carriersService: CarriersService,
		private readonly _warehousesService: WarehousesService,
		private readonly _usersService: UsersService,
		private readonly _productsService: ProductsService,
		private readonly _fakeOrdersService: FakeOrdersService
	) {}

	private _getRandomProduct = (
		orderCount: number,
		products: Product[]
	): IProduct => {
		return products[orderCount % products.length];
	};

	private _getRandomCustomer = (
		orderCount: number,
		customers: User[]
	): User => {
		if (orderCount < customers.length) {
			return customers[orderCount];
		} else {
			return customers[orderCount % customers.length];
		}
	};

	private _getRandomCarrierId = (
		orderCount: number,
		carriers: Carrier[]
	): string => {
		return carriers[orderCount % carriers.length].id;
	};

	private _prepareOrderFieldsValues = (orderCount: number) => {
		const hasCarrier = Math.random() > 0.07; // 7% chance, order have not carrier.
		const orderIsPaid = Math.random() > 0.15; // 15% chance, order to be cancelled.
		const numberOfProductsToOrder = orderCount % 4 || 1;

		return { numberOfProductsToOrder, hasCarrier, orderIsPaid };
	};

	private _getRandomOrderDate = (orderCount: number): Date => {
		const orderDate = new Date();

		orderDate.setFullYear(
			orderDate.getFullYear() - Math.round(Math.random() * 5)
		);

		const dateNow = new Date();

		const isCurrentYear = orderDate.getFullYear() === dateNow.getFullYear();

		const months = isCurrentYear ? Number(dateNow.getMonth()) : 11;

		orderDate.setMonth(months > 0 ? orderCount % months : 0);

		const isCurrentMonth =
			orderDate.getMonth() === dateNow.getMonth() && isCurrentYear;

		const days = isCurrentMonth ? Number(dateNow.getDate()) : 31;

		orderDate.setDate(orderCount % days);

		const isCurrentDay =
			orderDate.getDate() === dateNow.getDate() &&
			isCurrentYear &&
			isCurrentMonth;

		const hours = isCurrentDay ? Number(dateNow.getHours()) : 24;

		orderDate.setHours(orderCount % hours);

		return orderDate;
	};

	private _setupOrderProducts = (products: Product[]) => {
		let productCount = 1;
		const orderProducts = [];

		for (const p of products) {
			const productPrice = Math.round(Math.random() * 15);

			orderProducts.push({
				count: 2,
				isManufacturing: true,
				isCarrierRequired: true,
				isDeliveryRequired: true,
				price: productPrice,
				initialPrice: productPrice,
				product: p,
			});

			if (productCount >= 3) {
				break;
			}
			productCount += 1;
		}

		return orderProducts;
	};

	private _setupAvailableOrdersToCreate = (
		stores: Warehouse[],
		products: Product[],
		users: User[]
	) => {
		const orders = [];

		for (let orderNumber = 1; orderNumber <= 30; orderNumber += 1) {
			const orderStore = stores[_.random(stores.length - 1)];

			const orderProducts = this._setupOrderProducts(products);

			const createdAt = this.getCloseDate(new Date());

			orders.push({
				user: users[_.random(users.length - 1)],
				warehouse: orderStore._id.toString(),
				products: orderProducts,
				isConfirmed: true,
				isCancelled: false,
				isPaid: false,
				warehouseStatus: OrderWarehouseStatus.PackagingFinished,
				carrierStatus: OrderCarrierStatus.NoCarrier,
				orderNumber,
				_createdAt: createdAt,
			});
		}
		return orders;
	};

	private _setupHistoryOrdersToCreate = (
		stores: Warehouse[],
		products: Product[],
		users: User[],
		carrierId: string,
		orderNumber: number
	) => {
		const orders = [];

		const availableStatuses: OrderCarrierStatus[] = [
			OrderCarrierStatus.DeliveryCompleted,
			OrderCarrierStatus.IssuesDuringDelivery,
			OrderCarrierStatus.ClientRefuseTakingOrder,
		];

		for (let i = 1; i <= 12; i += 1) {
			const orderStore = stores[_.random(stores.length - 1)];

			const orderProducts = this._setupOrderProducts(products);

			const carrierStatus =
				availableStatuses[_.random(availableStatuses.length - 1)];

			const createdAt = this.getCloseDate(new Date());

			const startDeliveryTime = this.getFinishedTime(createdAt);

			orders.push({
				user: users[_.random(users.length - 1)],
				warehouse: orderStore._id.toString(),
				products: orderProducts,
				isConfirmed: true,
				isCancelled: false,
				carrier: carrierId,
				startDeliveryTime,
				deliveryTime:
					carrierStatus === OrderCarrierStatus.DeliveryCompleted
						? this.getFinishedTime(startDeliveryTime)
						: null,
				finishedProcessingTime:
					carrierStatus !== OrderCarrierStatus.DeliveryCompleted
						? this.getFinishedTime(startDeliveryTime)
						: null,
				isPaid: true,
				warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
				carrierStatus,
				orderNumber,
				_createdAt: createdAt,
			});
		}

		return orders;
	};

	@Query()
	async generateActiveAndAvailableOrdersPerCarrier() {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const users: User[] = await this._usersService.Model.find(
			commonOptionsFlag
		)
			.select({ __v: 0 })
			.lean()
			.exec();

		const stores: Warehouse[] = await this._warehousesService.Model.find(
			commonOptionsFlag
		)
			.select({ _id: 1 })
			.lean()
			.exec();

		const products: Product[] = await this._productsService.Model.find(
			commonOptionsFlag
		)
			.select({ __v: 0 })
			.lean()
			.exec();

		const ordersRaw = this._setupAvailableOrdersToCreate(
			stores,
			products,
			users
		);

		await this._ordersService.Model.insertMany(ordersRaw);
	}

	@Query()
	async generatePastOrdersPerCarrier() {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const users: User[] = await this._usersService.Model.find(
			commonOptionsFlag
		)
			.select({ __v: 0 })
			.lean()
			.exec();

		const stores: Warehouse[] = await this._warehousesService.Model.find(
			commonOptionsFlag
		)
			.select({ _id: 1 })
			.lean()
			.exec();

		const carrierIds: Carrier[] = await this._carriersService.Model.find(
			commonOptionsFlag
		)
			.select({ _id: 1 })
			.lean()
			.exec();

		const products: Product[] = await this._productsService.Model.find(
			commonOptionsFlag
		)
			.select({ __v: 0 })
			.lean()
			.exec();

		const totalOrdersToCreate = [];

		carrierIds.forEach((objectId, index) => {
			const carrierId = objectId._id.toString();
			const orderNumber = index;
			const ordersRaw = this._setupHistoryOrdersToCreate(
				stores,
				products,
				users,
				carrierId,
				orderNumber
			);

			totalOrdersToCreate.push(ordersRaw);
		});

		await this._ordersService.Model.insertMany(
			_.flatten(totalOrdersToCreate)
		);
	}

	@Query()
	async addTakenOrders(_context, { carrierIds }: { carrierIds: string[] }) {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const stores: Warehouse[] = await this._warehousesService.find(
			commonOptionsFlag
		);

		const customers: User[] = await this._usersService.find(
			commonOptionsFlag
		);

		const products: Product[] = await this._productsService.find(
			commonOptionsFlag
		);

		const ordersToCreate = [];

		carrierIds.forEach((id) => {
			for (let orderNumber = 1; orderNumber <= 20; orderNumber += 1) {
				const orderProducts = [];

				const productCount = Math.round(Math.random() * 4) || 1;
				for (let i = 0; i < productCount; i += 1) {
					const orderPrice = (orderNumber + i) % 110 || 1;

					orderProducts.push({
						count: (orderNumber + i) % 12 || 1,
						isManufacturing: true,
						isCarrierRequired: true,
						isDeliveryRequired: true,
						price: orderPrice,
						initialPrice: orderPrice,
						product: this._getRandomProduct(
							orderNumber + i,
							products
						),
					});
				}

				const orderIsPaid = Math.random() > 0.5;
				const createdAt = this._getRandomOrderDate(orderNumber);
				const startDeliveryTime = this.getFinishedTime(createdAt);

				ordersToCreate.push({
					isCancelled: !orderIsPaid,
					isPaid: orderIsPaid,
					deliveryTimeEstimate: 0,
					startDeliveryTime,
					deliveryTime: orderIsPaid
						? this.getFinishedTime(startDeliveryTime)
						: null,
					finishedProcessingTime: !orderIsPaid
						? this.getFinishedTime(startDeliveryTime)
						: null,
					warehouseStatus: OrderWarehouseStatus.PackagingFinished,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
					orderNumber,
					user: this._getRandomCustomer(orderNumber, customers),
					warehouse: stores[orderNumber % stores.length].id,
					products: orderProducts,
					_createdAt: createdAt,
					carrier: id,
				});
			}
		});

		await this._ordersService.Model.insertMany(ordersToCreate);
	}

	@Query()
	async addOrdersToTake() {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const stores: Warehouse[] = await this._warehousesService.find(
			commonOptionsFlag
		);

		const customers: User[] = await this._usersService.find(
			commonOptionsFlag
		);

		const products: Product[] = await this._productsService.find(
			commonOptionsFlag
		);

		const ordersToCreate = [];

		for (let i = 0; i < 3; i += 1) {
			for (let orderNumber = 1; orderNumber <= 10; orderNumber += 1) {
				const orderProducts = [];

				const productCount = Math.round(Math.random() * 4) || 1;

				for (let j = 0; j < productCount; j += 1) {
					const orderPrice = (orderNumber + j) % 110 || 1;

					orderProducts.push({
						count: (orderNumber + j) % 6 || 1,
						isManufacturing: true,
						isCarrierRequired: true,
						isDeliveryRequired: true,
						price: orderPrice,
						initialPrice: orderPrice,
						product: this._getRandomProduct(
							orderNumber + j,
							products
						),
					});
				}

				const createdAt = this.getCloseDate(new Date());

				ordersToCreate.push({
					isConfirmed: false,
					isCancelled: false,
					isPaid: false,
					deliveryTimeEstimate: 0,
					warehouseStatus: OrderWarehouseStatus.PackagingFinished,
					carrierStatus: OrderCarrierStatus.NoCarrier,
					orderNumber,
					user: this._getRandomCustomer(orderNumber, customers),
					warehouse: stores[orderNumber % stores.length].id,
					products: orderProducts,
					_createdAt: createdAt,
				});
			}
		}

		await this._ordersService.Model.insertMany(ordersToCreate);
	}

	@Query()
	async generateRandomOrdersCurrentStore(
		_context,
		{
			storeId,
			storeCreatedAt,
			ordersLimit,
		}: { storeId: string; storeCreatedAt: Date; ordersLimit: number }
	) {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const customers: User[] = await this._usersService.find(
			commonOptionsFlag
		);
		const carriers: Carrier[] = await this._carriersService.find(
			commonOptionsFlag
		);
		const products: Product[] = await this._productsService.find(
			commonOptionsFlag
		);

		let response = { error: false, message: null };

		try {
			const currentStoreOrders = [];
			const storeCreatedDate = new Date(storeCreatedAt);

			for (
				let orderNumber = 1;
				orderNumber <= ordersLimit;
				orderNumber += 1
			) {
				const carrierId = this._getRandomCarrierId(
					orderNumber,
					carriers
				);

				const orderRaw = this._fakeOrdersService.getOrderRaw(
					orderNumber,
					storeId,
					storeCreatedDate,
					carrierId,
					customers,
					products
				);

				currentStoreOrders.push(orderRaw);
			}

			await this._ordersService.Model.insertMany(currentStoreOrders);
		} catch (err) {
			response = { error: true, message: err.message };
		}

		return response;
	}

	@Query()
	async generateOrdersByCustomerId(
		_context,
		{
			numberOfOrders,
			customerId,
		}: { numberOfOrders: number; customerId: string }
	) {
		const commonOptionsFlag = { isDeleted: { $eq: false } };

		const stores: Warehouse[] = (
			await this._warehousesService.find(commonOptionsFlag)
		).filter((__, index) => index <= 20);

		const carriers: Carrier[] = await this._carriersService.find(
			commonOptionsFlag
		);

		const products: Product[] = await this._productsService.find(
			commonOptionsFlag
		);

		const user = await this._usersService
			.get(customerId)
			.pipe(first())
			.toPromise();

		if (products.length > 0) {
			const rawOrders = [];
			for (
				let orderNumber = 1;
				orderNumber <= numberOfOrders;
				orderNumber += 1
			) {
				const {
					numberOfProductsToOrder,
					hasCarrier,
					orderIsPaid,
				} = this._prepareOrderFieldsValues(orderNumber);

				const orderProducts = [];

				for (let i = 0; i < numberOfProductsToOrder; i += 1) {
					const orderPrice = (orderNumber + i) % 110 || 1;
					orderProducts.push({
						count: (orderNumber + i) % 6 || 1,
						isManufacturing: true,
						isCarrierRequired: hasCarrier,
						isDeliveryRequired: hasCarrier,
						price: orderPrice,
						initialPrice: orderPrice,
						product: this._getRandomProduct(
							orderNumber + i,
							products
						),
					});
				}

				const orderDate = this._getRandomOrderDate(orderNumber);
				const orderDeliveryTime = new Date(orderDate);

				// delivery time should be max to 2 hrs
				orderDeliveryTime.setMinutes(
					orderDeliveryTime.getMinutes() +
						Math.round(Math.random() * 90)
				);

				const startDeliveryTime = this.getFinishedTime(orderDate);

				rawOrders.push({
					isCancelled: !orderIsPaid,
					isPaid: orderIsPaid,
					deliveryTimeEstimate: 0,
					startDeliveryTime,
					deliveryTime: orderIsPaid
						? this.getFinishedTime(startDeliveryTime)
						: null,
					finishedProcessingTime: !orderIsPaid
						? this.getFinishedTime(startDeliveryTime)
						: null,
					warehouseStatus: OrderWarehouseStatus.PackagingFinished,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
					orderNumber,
					user,
					warehouse: stores[orderNumber % stores.length].id,
					products: orderProducts,
					_createdAt: orderDate,
					...(hasCarrier && {
						carrier: this._getRandomCarrierId(
							orderNumber,
							carriers
						),
					}),
				});
			}

			await this._ordersService.Model.insertMany(rawOrders);
		}
	}

	@Query()
	getOrdersChartTotalOrders() {
		return this._ordersService.getOrdersChartTotalOrders();
	}

	@Query()
	async getCompletedOrdersInfo(_context, { storeId }: { storeId: string }) {
		const orders = await this._ordersService.getDashboardCompletedOrders(
			storeId
		);
		return {
			totalOrders: orders.length,
			totalRevenue: orders
				.map((order) => order.totalPrice)
				.reduce((prevPrice, nextPrice) => prevPrice + nextPrice, 0),
		};
	}

	@Query()
	async getDashboardCompletedOrders() {
		return this._ordersService.getDashboardCompletedOrders();
	}

	@Query()
	async getDashboardCompletedOrdersToday() {
		return this._ordersService.getDashboardCompletedOrdersToday();
	}

	@Query('getOrder')
	async getOrder(_context, { id }: { id: string }): Promise<Order> {
		return this._ordersService.get(id).pipe(first()).toPromise();
	}

	@Query('orders')
	async getOrders(_context, { findInput }): Promise<Order[]> {
		return this._ordersService.find({
			...findInput,
			isDeleted: { $eq: false },
		});
	}

	@Query()
	async getOrderedUsersInfo(_context, { storeId }: { storeId: string }) {
		return this._ordersService.getOrderedUsersInfo(storeId);
	}

	@Query()
	async getUsersOrdersCountInfo(
		_context,
		{ usersIds }: { usersIds: string[] }
	) {
		const ordersInfo = await this._ordersService.Model.aggregate([
			{
				$match: {
					$and: [
						{ 'user._id': { $ne: null } },
						usersIds
							? {
									'user._id': {
										$in: usersIds.map(
											(i) => new ObjectId(i)
										),
									},
							  }
							: {},
					],
				},
			},
			{
				$group: {
					_id: '$user._id',
					ordersCount: { $sum: 1 },
				},
			},
		]);

		return ordersInfo.map((o) => ({
			id: o._id,
			ordersCount: o.ordersCount,
		}));
	}

	@Query()
	async getMerchantsOrdersCountInfo(
		_context,
		{ merchantsIds }: { merchantsIds: string[] }
	) {
		const ordersInfo = await this._ordersService.Model.aggregate([
			{
				$match: {
					$and: [
						{ warehouse: { $ne: null } },
						merchantsIds
							? { warehouse: { $in: merchantsIds } }
							: {},
					],
				},
			},
			{
				$group: {
					_id: '$warehouse',
					ordersCount: { $sum: 1 },
				},
			},
		]);

		return ordersInfo.map((o) => ({
			id: o._id,
			ordersCount: o.ordersCount,
		}));
	}

	@Mutation()
	async updateOrderCarrierStatus(
		_context,
		{
			orderId,
			status,
		}: {
			orderId: Order['id'];
			status: string;
		}
	): Promise<Order> {
		return this._ordersService.updateCarrierStatus(
			orderId,
			OrderCarrierStatus[status]
		);
	}

	@Mutation()
	async updateOrderWarehouseStatus(
		_context,
		{
			orderId,
			status,
		}: {
			orderId: Order['id'];
			status: string;
		}
	): Promise<Order> {
		return this._ordersService.updateWarehouseStatus(
			orderId,
			OrderWarehouseStatus[status]
		);
	}

	@Mutation()
	async payOrderWithStripe(
		_context,
		{
			orderId,
			cardId,
		}: {
			orderId: Order['id'];
			cardId: string;
		}
	): Promise<Order> {
		return this._ordersService.payWithStripe(orderId, cardId);
	}

	@ResolveProperty('carrier')
	async getCarrier(_order: IOrder): Promise<Carrier> {
		const order = new Order(_order);

		return order.carrierId == null
			? null
			: this._carriersService
					.get(order.carrierId)
					.pipe(first())
					.toPromise();
	}

	@ResolveProperty('warehouse')
	async getWarehouse(_order: IOrder): Promise<Warehouse> {
		const order = new Order(_order);

		return this._warehousesService
			.get(order.warehouseId)
			.pipe(first())
			.toPromise();
	}

	private getFinishedTime(date: Date): Date {
		const randomMinutes = _.random(1, 30);
		const randomSec = _.random(1, 60);
		const oldDate = new Date(date);

		oldDate.setSeconds(randomSec);

		return new Date(oldDate.setMinutes(date.getMinutes() + randomMinutes));
	}

	private getCloseDate(date: Date): Date {
		const randomMinutes = _.random(1, 10);
		const randomSec = _.random(1, 60);
		const oldDate = new Date(date);

		oldDate.setSeconds(randomSec);

		return new Date(oldDate.setMinutes(date.getMinutes() - randomMinutes));
	}
}
