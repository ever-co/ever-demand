import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the quantity validation inside `create()` is exercised.
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

describe('WarehousesOrdersService.create quantity validation', () => {
	let ordersService: { create: jest.Mock };
	let service: WarehousesOrdersService;

	const createWith = (count: any) =>
		service.create({
			warehouseId: 'w1',
			userId: 'u1',
			products: [{ productId: 'p1', count }],
		} as any);

	beforeEach(() => {
		ordersService = {
			create: jest.fn().mockResolvedValue({ products: [] }),
		};

		const usersService = { get: jest.fn(() => of({ id: 'u1' })) };
		const warehousesService = {
			get: jest.fn(() =>
				of({
					id: 'w1',
					products: [{ productId: 'p1', price: 10, product: {} }],
				})
			),
		};

		service = new WarehousesOrdersService(
			warehousesService as any,
			{} as any,
			{} as any,
			ordersService as any,
			usersService as any
		);

		jest.spyOn(service, 'getNextOrderNumber').mockResolvedValue(1);
		(service as any)._updateProductCount = jest.fn();
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
});
