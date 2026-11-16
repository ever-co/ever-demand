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

	const p1 = { id: 'p1' };
	const p2 = { id: 'p2' };

	beforeEach(() => {
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
			decreaseCount: jest.fn().mockResolvedValue(undefined),
			increaseSoldCount: jest.fn().mockResolvedValue(undefined),
		};

		const usersService = { get: jest.fn(() => of({ id: 'u1' })) };
		const warehousesService = {
			get: jest.fn(() =>
				of({
					id: 'w1',
					products: [
						{ productId: 'p1', price: 10, product: p1 },
						{ productId: 'p2', price: 20, product: p2 },
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
		await service.addMore('w1', 'u1', 'o1', [{ productId: 'p2', count: 1 }]);

		expect(warehousesProductsService.decreaseCount).toHaveBeenCalledTimes(1);
		expect(warehousesProductsService.decreaseCount).toHaveBeenCalledWith(
			'w1',
			'p2',
			1
		);
		expect(warehousesProductsService.increaseSoldCount).toHaveBeenCalledTimes(
			1
		);
		expect(warehousesProductsService.increaseSoldCount).toHaveBeenCalledWith(
			'w1',
			'p2',
			1
		);
	});

	it('still saves existing and new products on the order', async () => {
		await service.addMore('w1', 'u1', 'o1', [{ productId: 'p2', count: 1 }]);

		const update = ordersService.update.mock.calls[0][1];
		expect(update.products.map((p) => p.product.id)).toEqual(['p1', 'p2']);
	});
});
