import 'reflect-metadata';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test, as OrdersService.cancel.spec.ts does: only
// `updateCarrierStatus()` is exercised, against one order held in memory.
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

describe('OrdersService.updateCarrierStatus delivery time estimate', () => {
	let stored: Record<string, any>;
	let findOneAndUpdate: jest.Mock;
	let service: OrdersService;

	const read = () => ({ id: ORDER_ID, ...stored });

	beforeEach(() => {
		stored = {
			_id: ORDER_ID,
			warehouse: 'w1',
			carrier: 'c1',
			isCancelled: false,
			isPaid: false,
			carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
			warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			deliveryTimeEstimate: 900,
		};

		findOneAndUpdate = jest.fn((_filter: any, updateObj: any) => ({
			lean: () => ({
				exec: async () => {
					Object.assign(stored, updateObj);

					return { ...stored };
				},
			}),
		}));

		service = new OrdersService(
			{} as any,
			{} as any,
			{ increaseNumberOfDeliveries: jest.fn() } as any,
			{} as any,
			{} as any,
			{} as any
		);

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any)._get = jest.fn(async () => read());
		(service as any).getCurrent = jest.fn(async () => read());
		(service as any).Model = { findOneAndUpdate };
		(service as any).existence = { next: jest.fn() };
	});

	it.each([
		['delivered', OrderCarrierStatus.DeliveryCompleted],
		['returned with an issue', OrderCarrierStatus.IssuesDuringDelivery],
	])(
		'resets the estimate to 0 when the carrier app marks an order %s',
		async (_label, status: OrderCarrierStatus) => {
			await service.updateCarrierStatus(ORDER_ID, status);

			expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
			expect(findOneAndUpdate.mock.calls[0][1]).toMatchObject({
				carrierStatus: status,
				deliveryTimeEstimate: 0,
			});
			expect(stored.deliveryTimeEstimate).toBe(0);
		}
	);

	it('resets the estimate to 0 when the client refuses the order', async () => {
		stored.carrierStatus = OrderCarrierStatus.CarrierArrivedToCustomer;

		await service.updateCarrierStatus(
			ORDER_ID,
			OrderCarrierStatus.ClientRefuseTakingOrder
		);

		expect(stored.deliveryTimeEstimate).toBe(0);
	});

	it('keeps the estimate while the carrier is still on the way', async () => {
		await service.updateCarrierStatus(
			ORDER_ID,
			OrderCarrierStatus.CarrierArrivedToCustomer
		);

		expect(findOneAndUpdate.mock.calls[0][1]).not.toHaveProperty(
			'deliveryTimeEstimate'
		);
		expect(stored.deliveryTimeEstimate).toBe(900);
	});
});
