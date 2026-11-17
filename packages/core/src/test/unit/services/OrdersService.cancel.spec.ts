import 'reflect-metadata';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the final-status guard inside `cancel()` is exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({ DBService: class {} }));
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
	Stripe: jest.fn().mockImplementation(() => ({})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

describe('OrdersService.cancel', () => {
	let service: OrdersService;
	let order: {
		id: string;
		isCancelled: boolean;
		carrierStatus: OrderCarrierStatus;
		warehouseStatus: OrderWarehouseStatus;
	};
	let update: jest.Mock;

	beforeEach(() => {
		order = {
			id: 'o1',
			isCancelled: false,
			carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
			warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
		};

		service = new OrdersService(
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		update = jest.fn(async (_id, updateObj) => ({
			...order,
			...updateObj,
		}));

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any)._get = jest.fn(async () => order);
		(service as any).update = update;
	});

	it('refuses to cancel a delivered order and does not write it', async () => {
		order.carrierStatus = OrderCarrierStatus.DeliveryCompleted;

		await expect(service.cancel('o1')).rejects.toThrow(
			/can not be cancelled/
		);

		expect(update).not.toHaveBeenCalled();
	});

	it('refuses to cancel an order given to the customer and does not write it', async () => {
		order.warehouseStatus = OrderWarehouseStatus.GivenToCustomer;

		await expect(service.cancel('o1')).rejects.toThrow(
			/can not be cancelled/
		);

		expect(update).not.toHaveBeenCalled();
	});

	it('cancels an order that is still on its way', async () => {
		const cancelled = await service.cancel('o1');

		expect(update).toHaveBeenCalledWith(
			'o1',
			expect.objectContaining({ isCancelled: true })
		);
		expect(cancelled.isCancelled).toBe(true);
	});
});
