import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the stock accounting inside `addMore()` is exercised.
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

describe('WarehousesOrdersService.addMore stock accounting', () => {
	let ordersService: { get: jest.Mock; update: jest.Mock };
	let warehousesProductsService: {
		decreaseCount: jest.Mock;
		increaseSoldCount: jest.Mock;
	};
	let service: WarehousesOrdersService;
	// Store stock and sold counts, changed only through the fake
	// decreaseCount / increaseSoldCount below (same rules as the real ones).
	let stock: { [productId: string]: number };
	let sold: { [productId: string]: number };

	const p1 = { id: 'p1' };
	const p2 = { id: 'p2' };

	beforeEach(() => {
		// The order was created with p1 x 1, so p1 stock already went 5 -> 4.
		stock = { p1: 4, p2: 3 };
		sold = { p1: 1, p2: 0 };

		const existingOrder = {
			id: 'o1',
			warehouseId: 'w1',
			user: { id: 'u1' },
			products: [{ product: p1, count: 1 }],
		};

		ordersService = {
			get: jest.fn(() => of(existingOrder)),
			update: jest.fn(async (_id, update) => ({
				...existingOrder,
				...update,
			})),
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
			increaseSoldCount: jest.fn(async (_w, productId, count) => {
				sold[productId] += count;
			}),
		};

		const usersService = { get: jest.fn(() => of({ id: 'u1' })) };
		const warehousesService = {
			get: jest.fn(() =>
				of({
					id: 'w1',
					products: [
						{
							productId: 'p1',
							price: 10,
							count: stock.p1,
							product: p1,
						},
						{
							productId: 'p2',
							price: 20,
							count: stock.p2,
							product: p2,
						},
					],
				})
			),
		};

		service = new WarehousesOrdersService(
			warehousesService as any,
			{} as any,
			warehousesProductsService as any,
			ordersService as any,
			usersService as any
		);
	});

	it('takes only the newly added products out of stock', async () => {
		await service.addMore('w1', 'u1', 'o1', [
			{ productId: 'p2', count: 1 },
		]);

		expect(warehousesProductsService.decreaseCount).toHaveBeenCalledTimes(
			1
		);
		expect(warehousesProductsService.decreaseCount).toHaveBeenCalledWith(
			'w1',
			'p2',
			1
		);
		expect(
			warehousesProductsService.increaseSoldCount
		).toHaveBeenCalledTimes(1);
		expect(
			warehousesProductsService.increaseSoldCount
		).toHaveBeenCalledWith('w1', 'p2', 1);
	});

	it('still saves existing and new products on the order', async () => {
		await service.addMore('w1', 'u1', 'o1', [
			{ productId: 'p2', count: 1 },
		]);

		const update = ordersService.update.mock.calls[0][1];
		expect(update.products.map((p) => p.product.id)).toEqual(['p1', 'p2']);
	});

	it('leaves the stock of products already in the order untouched', async () => {
		await service.addMore('w1', 'u1', 'o1', [
			{ productId: 'p2', count: 2 },
		]);

		// p1: 5 at start, 1 taken by create(), nothing more taken by addMore.
		expect(stock).toEqual({ p1: 4, p2: 1 });
		expect(sold).toEqual({ p1: 1, p2: 2 });
	});

	it('counts more of a product already in the order only once', async () => {
		await service.addMore('w1', 'u1', 'o1', [
			{ productId: 'p1', count: 2 },
		]);

		const update = ordersService.update.mock.calls[0][1];
		const p1Total = update.products
			.filter((p) => p.product.id === 'p1')
			.reduce((sum, p) => sum + p.count, 0);

		// The order now holds 3 x p1 and exactly 3 have left stock (5 -> 2).
		expect(p1Total).toBe(3);
		expect(stock.p1).toBe(2);
		expect(sold.p1).toBe(3);
	});

	it('saves nothing and takes no stock when stock is short', async () => {
		await expect(
			service.addMore('w1', 'u1', 'o1', [
				{ productId: 'p1', count: 1 },
				{ productId: 'p2', count: 4 },
			])
		).rejects.toThrow(/more products than available/);

		expect(ordersService.update).not.toHaveBeenCalled();
		expect(warehousesProductsService.decreaseCount).not.toHaveBeenCalled();
		expect(stock).toEqual({ p1: 4, p2: 3 });
		expect(sold).toEqual({ p1: 1, p2: 0 });
	});

	it('adds up repeated lines of one product before checking stock', async () => {
		await expect(
			service.addMore('w1', 'u1', 'o1', [
				{ productId: 'p2', count: 2 },
				{ productId: 'p2', count: 2 },
			])
		).rejects.toThrow(/more products than available/);

		expect(ordersService.update).not.toHaveBeenCalled();
		expect(stock).toEqual({ p1: 4, p2: 3 });
	});
});
