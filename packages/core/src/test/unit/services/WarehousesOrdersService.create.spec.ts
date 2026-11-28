import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the quantity, customer and stock handling inside
// `create()` is exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({ ExistenceEventType: {} }));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses/WarehousesService', () => ({
	WarehousesService: class {},
}));
jest.mock('../../../services/warehouses/WarehousesProductsService', () => ({
	WarehousesProductsService: class {},
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));
jest.mock('../../../services/orders', () => ({ OrdersService: class {} }));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));

import { WarehousesOrdersService } from '../../../services/warehouses/WarehousesOrdersService';

describe('WarehousesOrdersService.create validation', () => {
	let ordersService: { create: jest.Mock };
	let usersService: { get: jest.Mock };
	let warehousesService: { get: jest.Mock };
	let warehousesProductsService: {
		decreaseCount: jest.Mock;
		increaseCount: jest.Mock;
		increaseSoldCount: jest.Mock;
	};
	let service: WarehousesOrdersService;
	// Stock and sold counts in the database, changed only through the fake
	// decreaseCount / increaseCount / increaseSoldCount below (same rule as
	// the real ones: a decrease below zero is refused at write time).
	let stock: { [productId: string]: number };
	let sold: { [productId: string]: number };

	/** The store as create() reads it: products with the given stock. */
	const storeShowing = (counts: { [productId: string]: number }) => ({
		id: 'w1',
		products: Object.keys(counts).map((productId) => ({
			productId,
			price: 10,
			count: counts[productId],
			product: { id: productId },
		})),
	});

	const createWith = (count: any) =>
		service.create({
			warehouseId: 'w1',
			userId: 'u1',
			products: [{ productId: 'p1', count }],
		} as any);

	beforeEach(() => {
		stock = { p1: 5, p2: 3 };
		sold = { p1: 0, p2: 0 };

		ordersService = {
			create: jest.fn(async (order) => ({ id: 'o1', ...order })),
		};

		warehousesProductsService = {
			decreaseCount: jest.fn(async (_w, productId, count) => {
				if (stock[productId] < count) {
					throw new Error(
						'Request to remove more products than available'
					);
				}
				stock[productId] -= count;
			}),
			increaseCount: jest.fn(async (_w, productId, count) => {
				stock[productId] += count;
			}),
			increaseSoldCount: jest.fn(async (_w, productId, count) => {
				sold[productId] += count;
			}),
		};

		usersService = { get: jest.fn(() => of({ id: 'u1' })) };
		warehousesService = {
			get: jest.fn(() => of(storeShowing(stock))),
		};

		service = new WarehousesOrdersService(
			warehousesService as any,
			{} as any,
			warehousesProductsService as any,
			ordersService as any,
			usersService as any
		);

		jest.spyOn(service, 'getNextOrderNumber').mockResolvedValue(1);
	});

	it.each([0, -1, 1.5, 10001])(
		'rejects count %p and does not create an order',
		async (count) => {
			await expect(createWith(count)).rejects.toThrow(/Invalid quantity/);
			expect(ordersService.create).not.toHaveBeenCalled();
		}
	);

	it('still creates an order for a valid quantity', async () => {
		await createWith(2);
		expect(ordersService.create).toHaveBeenCalledTimes(1);
	});

	it('rejects a banned customer and does not create an order', async () => {
		usersService.get.mockReturnValue(of({ id: 'u1', isBanned: true }));

		await expect(createWith(2)).rejects.toThrow('Customer u1 is banned');
		expect(ordersService.create).not.toHaveBeenCalled();
	});

	it('rejects a count above stock and creates no order', async () => {
		await expect(createWith(6)).rejects.toThrow(
			/more products than available/
		);
		expect(ordersService.create).not.toHaveBeenCalled();
	});

	it('adds up repeated lines of one product before checking stock', async () => {
		await expect(
			service.create({
				warehouseId: 'w1',
				userId: 'u1',
				products: [
					{ productId: 'p1', count: 3 },
					{ productId: 'p1', count: 3 },
				],
			} as any)
		).rejects.toThrow(/more products than available/);
		expect(ordersService.create).not.toHaveBeenCalled();
	});

	describe('stock taken at write time', () => {
		const orderBoth = () =>
			service.create({
				warehouseId: 'w1',
				userId: 'u1',
				products: [
					{ productId: 'p1', count: 2 },
					{ productId: 'p2', count: 2 },
				],
			} as any);

		/** Another order takes 2 x p2 after create() read the store. */
		const anotherOrderTakesP2 = () => {
			warehousesService.get.mockReturnValue(
				of(storeShowing({ p1: 5, p2: 3 }))
			);
			stock.p2 = 1;
		};

		it('takes the stock of every line, saves the order, then counts the sales', async () => {
			let stockAtSave: typeof stock | undefined;
			ordersService.create.mockImplementation(async (order) => {
				stockAtSave = { ...stock };
				return { id: 'o1', ...order };
			});

			const order = await orderBoth();

			expect(order.id).toBe('o1');
			// the order is saved only once every line has its stock
			expect(stockAtSave).toEqual({ p1: 3, p2: 1 });
			expect(stock).toEqual({ p1: 3, p2: 1 });
			expect(sold).toEqual({ p1: 2, p2: 2 });
			expect(
				warehousesProductsService.increaseCount
			).not.toHaveBeenCalled();
		});

		it('creates no order and puts the first line back when the second line is refused', async () => {
			anotherOrderTakesP2();

			const refusal = new Error(
				'Request to remove more products than available'
			);
			const decrease = warehousesProductsService.decreaseCount;
			const storeDecrease = decrease.getMockImplementation()!;
			decrease.mockImplementation(async (w, productId, count) => {
				if (stock[productId] < count) {
					throw refusal;
				}
				return storeDecrease(w, productId, count);
			});

			// the same error the store gave, not another one
			await expect(orderBoth()).rejects.toBe(refusal);

			expect(ordersService.create).not.toHaveBeenCalled();
			expect(stock).toEqual({ p1: 5, p2: 1 });
			expect(sold).toEqual({ p1: 0, p2: 0 });
			expect(
				warehousesProductsService.increaseCount
			).toHaveBeenCalledWith('w1', 'p1', 2);
		});

		it('puts the stock back when the order cannot be saved', async () => {
			let stockAtSave: typeof stock | undefined;
			const saveError = new Error('order save failed');
			ordersService.create.mockImplementation(async () => {
				stockAtSave = { ...stock };
				throw saveError;
			});

			await expect(orderBoth()).rejects.toBe(saveError);

			// the stock was taken before the save, and is back after it failed
			expect(stockAtSave).toEqual({ p1: 3, p2: 1 });
			expect(stock).toEqual({ p1: 5, p2: 3 });
			expect(sold).toEqual({ p1: 0, p2: 0 });
		});

		it('keeps the refusal as the error when putting the stock back fails too', async () => {
			anotherOrderTakesP2();
			warehousesProductsService.increaseCount.mockRejectedValue(
				new Error('database down')
			);

			await expect(orderBoth()).rejects.toThrow(
				'Request to remove more products than available'
			);
			expect(ordersService.create).not.toHaveBeenCalled();
		});

		it('saves only one order when two customers order the last 2 items at once', async () => {
			stock = { p1: 2, p2: 0 };

			const results = await Promise.allSettled([
				createWith(2),
				createWith(2),
			]);

			// both passed the stock check, only one got the stock
			expect(results.map((r) => r.status).sort()).toEqual([
				'fulfilled',
				'rejected',
			]);
			expect(ordersService.create).toHaveBeenCalledTimes(1);
			expect(stock.p1).toBe(0);
			expect(sold.p1).toBe(2);
		});
	});
});
