import 'reflect-metadata';
import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the guards and stock return inside `cancel()` are exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({ ExistenceEventType: {} }));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	}),
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

describe('WarehousesOrdersService.cancel', () => {
	let order: {
		id: string;
		warehouseId: string;
		isCancelled: boolean;
		isConfirmed: boolean;
		carrierStatus: OrderCarrierStatus;
		warehouseStatus: OrderWarehouseStatus;
		products: any[];
	};
	let ordersService: { get: jest.Mock; cancel: jest.Mock };
	let warehousesProductsService: {
		add: jest.Mock;
		decreaseSoldCount: jest.Mock;
	};
	let service: WarehousesOrdersService;

	beforeEach(() => {
		order = {
			id: 'o1',
			warehouseId: 'w1',
			isCancelled: false,
			isConfirmed: true,
			carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
			warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			products: [
				{
					product: { id: 'p1' },
					count: 2,
					price: 10,
					initialPrice: 12,
					deliveryTimeMin: 30,
					deliveryTimeMax: 60,
				},
			],
		};

		ordersService = {
			get: jest.fn(() => of(order)),
			cancel: jest.fn(async () => ({ ...order, isCancelled: true })),
		};

		warehousesProductsService = {
			add: jest.fn(async () => []),
			decreaseSoldCount: jest.fn(async () => undefined),
		};

		service = new WarehousesOrdersService(
			{} as any,
			{} as any,
			warehousesProductsService as any,
			ordersService as any,
			{} as any
		);
	});

	it('refuses a delivered order and leaves the order and stock alone', async () => {
		order.carrierStatus = OrderCarrierStatus.DeliveryCompleted;

		await expect(service.cancel('o1')).rejects.toThrow(
			/can not be cancelled/
		);

		expect(ordersService.cancel).not.toHaveBeenCalled();
		expect(warehousesProductsService.add).not.toHaveBeenCalled();
		expect(
			warehousesProductsService.decreaseSoldCount
		).not.toHaveBeenCalled();
	});

	it('refuses an order given to the customer and leaves the order and stock alone', async () => {
		order.carrierStatus = OrderCarrierStatus.NoCarrier;
		order.warehouseStatus = OrderWarehouseStatus.GivenToCustomer;

		await expect(service.cancel('o1')).rejects.toThrow(
			/can not be cancelled/
		);

		expect(ordersService.cancel).not.toHaveBeenCalled();
		expect(warehousesProductsService.add).not.toHaveBeenCalled();
		expect(
			warehousesProductsService.decreaseSoldCount
		).not.toHaveBeenCalled();
	});

	it('returns the order when it is already cancelled and does not restock again', async () => {
		order.isCancelled = true;

		const result = await service.cancel('o1');

		expect(result).toBe(order);
		expect(result.id).toBe('o1');
		expect(ordersService.cancel).not.toHaveBeenCalled();
		expect(warehousesProductsService.add).not.toHaveBeenCalled();
		expect(
			warehousesProductsService.decreaseSoldCount
		).not.toHaveBeenCalled();
	});

	it.each([
		['carrier issue during delivery (204)', { carrierStatus: 204 }],
		['client refused the order (205)', { carrierStatus: 205 }],
		['allocation failed (200)', { warehouseStatus: 200 }],
		['packaging failed (201)', { warehouseStatus: 201 }],
	])(
		'still cancels and restocks an order with %s',
		async (_label, statuses) => {
			Object.assign(order, statuses);

			const result = await service.cancel('o1');

			expect(result.isCancelled).toBe(true);
			expect(ordersService.cancel).toHaveBeenCalledWith('o1');
			expect(warehousesProductsService.add).toHaveBeenCalledWith('w1', [
				{
					product: 'p1',
					count: 2,
					price: 10,
					initialPrice: 12,
					deliveryTimeMin: 30,
					deliveryTimeMax: 60,
				},
			]);
			expect(
				warehousesProductsService.decreaseSoldCount
			).toHaveBeenCalledWith('w1', 'p1', 2);
		}
	);
});
