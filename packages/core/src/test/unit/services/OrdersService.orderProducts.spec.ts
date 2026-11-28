import 'reflect-metadata';
import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the order product changes and their stock writes are exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {},
	ExistenceEventType: { Updated: 'updated' },
}));
jest.mock('../../../env', () => ({
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
}));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/carriers/CarriersService', () => ({
	__esModule: true,
	default: class {},
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));
jest.mock('stripe', () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';
const STORE_ID = 'store-1';
const OTHER_STORE_ID = 'store-2';

function orderLine(productId: string, count: number) {
	return {
		id: `line-${productId}`,
		count,
		price: 10,
		initialPrice: 12,
		product: { id: productId },
	};
}

function storeProduct(productId: string) {
	return {
		productId,
		count: 100,
		price: 10,
		initialPrice: 12,
		deliveryTimeMin: 10,
		deliveryTimeMax: 20,
		product: { id: productId },
		isManufacturing: false,
		isCarrierRequired: true,
		isDeliveryRequired: true,
		isTakeaway: false,
	};
}

describe('OrdersService order product changes', () => {
	let stored: Record<string, any>;
	let stock: {
		increaseCount: jest.Mock;
		decreaseCount: jest.Mock;
		increaseSoldCount: jest.Mock;
		decreaseSoldCount: jest.Mock;
	};
	let warehousesService: { get: jest.Mock };
	let update: jest.Mock;
	let service: OrdersService;

	// What a read returns: a copy of the stored order at the time of the read
	const read = () => ({
		...stored,
		id: ORDER_ID,
		warehouseId: stored.warehouse,
		products: stored.products.map((p) => ({
			...p,
			product: { ...p.product },
		})),
	});

	const noStockWrites = () => {
		expect(stock.increaseCount).not.toHaveBeenCalled();
		expect(stock.decreaseCount).not.toHaveBeenCalled();
		expect(stock.increaseSoldCount).not.toHaveBeenCalled();
		expect(stock.decreaseSoldCount).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	};

	beforeEach(() => {
		stored = {
			_id: ORDER_ID,
			warehouse: STORE_ID,
			isCancelled: false,
			carrierStatus: OrderCarrierStatus.NoCarrier,
			warehouseStatus: OrderWarehouseStatus.PackagingStarted,
			products: [orderLine('p1', 3), orderLine('p2', 1)],
		};

		stock = {
			increaseCount: jest.fn(async () => undefined),
			decreaseCount: jest.fn(async () => undefined),
			increaseSoldCount: jest.fn(async () => undefined),
			decreaseSoldCount: jest.fn(async () => undefined),
		};

		warehousesService = {
			get: jest.fn(() =>
				of({
					id: STORE_ID,
					products: ['p1', 'p2', 'p3'].map(storeProduct),
				})
			),
		};

		service = new OrdersService(
			warehousesService as any,
			{} as any,
			{} as any,
			stock as any,
			{} as any,
			{} as any
		);

		update = jest.fn(async (_id, updateObj) => ({
			...read(),
			...updateObj,
		}));

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any)._get = jest.fn(async () => read());
		(service as any).update = update;
	});

	// Orders whose products were already put back into stock (cancelled)
	// or left the store (handed over to the carrier or to the customer)
	const lockedOrders: [string, Record<string, any>][] = [
		['cancelled', { isCancelled: true }],
		[
			'delivered by the carrier',
			{
				carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			},
		],
		[
			'given to the carrier',
			{
				carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
				warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			},
		],
		[
			'picked up by its carrier while the store status is still PackagingFinished',
			{
				carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
				warehouseStatus: OrderWarehouseStatus.PackagingFinished,
			},
		],
		[
			'given to the customer (takeaway)',
			{ warehouseStatus: OrderWarehouseStatus.GivenToCustomer },
		],
	];

	describe('removeProducts', () => {
		it('refuses a cancelled order and does not put its products back into stock', async () => {
			stored.isCancelled = true;

			await expect(
				service.removeProducts(ORDER_ID, ['p1'])
			).rejects.toThrow(/is cancelled/);

			noStockWrites();
		});

		it('refuses an order given to the customer and does not restock it', async () => {
			stored.warehouseStatus = OrderWarehouseStatus.GivenToCustomer;

			await expect(
				service.removeProducts(ORDER_ID, ['p1'])
			).rejects.toThrow(/was already handed over/);

			noStockWrites();
		});

		it.each(lockedOrders)(
			'refuses an order that is %s',
			async (_name, state) => {
				Object.assign(stored, state);

				await expect(
					service.removeProducts(ORDER_ID, ['p1'])
				).rejects.toThrow(/its products can not change/);

				noStockWrites();
			}
		);

		it('removes a line of an open order, restocks the order store and saves the order', async () => {
			const order = await service.removeProducts(ORDER_ID, ['p1']);

			expect(stock.decreaseSoldCount).toHaveBeenCalledTimes(1);
			expect(stock.decreaseSoldCount).toHaveBeenCalledWith(
				STORE_ID,
				'p1',
				3
			);
			expect(stock.increaseCount).toHaveBeenCalledTimes(1);
			expect(stock.increaseCount).toHaveBeenCalledWith(STORE_ID, 'p1', 3);
			expect(update).toHaveBeenCalledWith(ORDER_ID, {
				products: [expect.objectContaining({ product: { id: 'p2' } })],
			});
			expect(order.products).toHaveLength(1);
		});
	});

	describe('decreaseOrderProducts', () => {
		it('refuses when a later line would reach 0 and restocks no line', async () => {
			// p1: 3 -> 2 is fine, p2: 1 -> 0 is not
			await expect(
				service.decreaseOrderProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 1 },
						{ productId: 'p2', count: 1 },
					],
					STORE_ID
				)
			).rejects.toThrow(/can not decrease product to be === 0/);

			noStockWrites();
		});

		it('refuses when one product appears twice and both together would reach 0', async () => {
			await expect(
				service.decreaseOrderProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 2 },
						{ productId: 'p1', count: 1 },
					],
					STORE_ID
				)
			).rejects.toThrow(/can not decrease product to be === 0/);

			noStockWrites();
		});

		it('refuses a product that is not in the order and writes no stock', async () => {
			await expect(
				service.decreaseOrderProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 1 },
						{ productId: 'p3', count: 1 },
					],
					STORE_ID
				)
			).rejects.toThrow(/has no product with the id p3/);

			noStockWrites();
		});

		it("refuses another store's warehouse id and writes no stock", async () => {
			await expect(
				service.decreaseOrderProducts(
					ORDER_ID,
					[{ productId: 'p1', count: 1 }],
					OTHER_STORE_ID
				)
			).rejects.toThrow(/belongs to another store/);

			noStockWrites();
		});

		it.each(lockedOrders)(
			'refuses an order that is %s',
			async (_name, state) => {
				Object.assign(stored, state);

				await expect(
					service.decreaseOrderProducts(
						ORDER_ID,
						[{ productId: 'p1', count: 1 }],
						STORE_ID
					)
				).rejects.toThrow(/its products can not change/);

				noStockWrites();
			}
		);

		it('lowers the line count of an open order, restocks the order store and saves the order', async () => {
			const order = await service.decreaseOrderProducts(
				ORDER_ID,
				[{ productId: 'p1', count: 2 }],
				STORE_ID
			);

			expect(stock.decreaseSoldCount).toHaveBeenCalledTimes(1);
			expect(stock.decreaseSoldCount).toHaveBeenCalledWith(
				STORE_ID,
				'p1',
				2
			);
			expect(stock.increaseCount).toHaveBeenCalledTimes(1);
			expect(stock.increaseCount).toHaveBeenCalledWith(STORE_ID, 'p1', 2);
			expect(stock.decreaseCount).not.toHaveBeenCalled();
			expect(update).toHaveBeenCalledWith(ORDER_ID, {
				products: [
					expect.objectContaining({
						product: { id: 'p1' },
						count: 1,
					}),
					expect.objectContaining({
						product: { id: 'p2' },
						count: 1,
					}),
				],
			});
			expect(order.products).toHaveLength(2);
		});
	});

	describe('addProducts', () => {
		it("refuses another store's warehouse id and takes no stock from it", async () => {
			await expect(
				service.addProducts(
					ORDER_ID,
					[{ productId: 'p1', count: 1 }],
					OTHER_STORE_ID
				)
			).rejects.toThrow(/belongs to another store/);

			expect(stock.decreaseCount).not.toHaveBeenCalled();
			noStockWrites();
		});

		it.each(lockedOrders)(
			'refuses an order that is %s',
			async (_name, state) => {
				Object.assign(stored, state);

				await expect(
					service.addProducts(
						ORDER_ID,
						[{ productId: 'p1', count: 1 }],
						STORE_ID
					)
				).rejects.toThrow(/its products can not change/);

				noStockWrites();
			}
		);

		it('refuses a product the store does not sell before taking stock for the other lines', async () => {
			await expect(
				service.addProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 1 },
						{ productId: 'unknown', count: 1 },
					],
					STORE_ID
				)
			).rejects.toThrow(/there is no product with the id unknown/);

			noStockWrites();
		});

		it('adds to an open order, takes the stock from the order store and saves the order', async () => {
			const order = await service.addProducts(
				ORDER_ID,
				[
					{ productId: 'p1', count: 2 },
					{ productId: 'p3', count: 4 },
				],
				STORE_ID
			);

			expect(warehousesService.get).toHaveBeenCalledWith(STORE_ID, true);
			expect(stock.decreaseCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 2],
				[STORE_ID, 'p3', 4],
			]);
			expect(stock.increaseSoldCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 2],
				[STORE_ID, 'p3', 4],
			]);
			expect(stock.increaseCount).not.toHaveBeenCalled();
			expect(update).toHaveBeenCalledWith(ORDER_ID, {
				products: [
					expect.objectContaining({
						product: { id: 'p1' },
						count: 5,
					}),
					expect.objectContaining({
						product: { id: 'p2' },
						count: 1,
					}),
					expect.objectContaining({
						product: { id: 'p3' },
						count: 4,
					}),
				],
			});
			expect(order.products).toHaveLength(3);
			// the sold counts go up only once the order holds the lines
			expect(
				Math.max(...stock.decreaseCount.mock.invocationCallOrder)
			).toBeLessThan(update.mock.invocationCallOrder[0]);
			expect(update.mock.invocationCallOrder[0]).toBeLessThan(
				Math.min(...stock.increaseSoldCount.mock.invocationCallOrder)
			);
		});

		it('a later line with too little stock puts the earlier lines back and raises no sold count', async () => {
			// p1 (already in the order) gets its stock, the new p3 line is refused
			stock.decreaseCount.mockImplementation(async (_store, productId) => {
				if (productId === 'p3') {
					throw new Error(
						'Request to remove more products than available'
					);
				}
			});

			await expect(
				service.addProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 1 },
						{ productId: 'p3', count: 3 },
					],
					STORE_ID
				)
			).rejects.toThrow(/more products than available/);

			expect(stock.decreaseCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 1],
				[STORE_ID, 'p3', 3],
			]);
			expect(stock.increaseCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 1],
			]);
			expect(stock.increaseSoldCount).not.toHaveBeenCalled();
			expect(stock.decreaseSoldCount).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();
		});

		it('a failed order save puts the stock back', async () => {
			update.mockRejectedValueOnce(new Error('order write failed'));

			await expect(
				service.addProducts(
					ORDER_ID,
					[
						{ productId: 'p1', count: 2 },
						{ productId: 'p3', count: 4 },
					],
					STORE_ID
				)
			).rejects.toThrow('order write failed');

			expect(stock.decreaseCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 2],
				[STORE_ID, 'p3', 4],
			]);
			expect(stock.increaseCount.mock.calls).toEqual([
				[STORE_ID, 'p1', 2],
				[STORE_ID, 'p3', 4],
			]);
			expect(stock.increaseSoldCount).not.toHaveBeenCalled();
			expect(stock.decreaseSoldCount).not.toHaveBeenCalled();
		});
	});
});
