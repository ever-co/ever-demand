import 'reflect-metadata';
import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the refund guard inside `refundWithStripe()` is exercised.
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

// Fake payment provider: every `new Stripe()` shares this refunds.create.
const mockRefundsCreate = jest.fn();
jest.mock('stripe', () => ({
	Stripe: jest.fn().mockImplementation(() => ({
		charges: { create: jest.fn() },
		refunds: { create: mockRefundsCreate },
	})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

describe('OrdersService.refundWithStripe', () => {
	let service: OrdersService;
	let order: {
		id: string;
		isPaid: boolean;
		isCancelled: boolean;
		carrierStatus: OrderCarrierStatus;
		warehouseStatus: OrderWarehouseStatus;
		stripeChargeId?: string;
	};

	beforeEach(() => {
		mockRefundsCreate.mockReset();
		mockRefundsCreate.mockResolvedValue({ id: 're_1' });

		order = {
			id: 'o1',
			isPaid: true,
			isCancelled: true,
			carrierStatus: OrderCarrierStatus.NoCarrier,
			warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
			stripeChargeId: 'ch_1',
		};

		service = new OrdersService(
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any).get = jest.fn(() => of(order));
	});

	it('rejects an order that is not cancelled and never refunds the charge', async () => {
		order.isCancelled = false;

		await expect(service.refundWithStripe('o1')).rejects.toThrow(
			/not cancelled/
		);

		expect(mockRefundsCreate).not.toHaveBeenCalled();
	});

	it('rejects a cancelled order the carrier delivered and never refunds the charge', async () => {
		order.carrierStatus = OrderCarrierStatus.DeliveryCompleted;
		order.warehouseStatus = OrderWarehouseStatus.GivenToCarrier;

		await expect(service.refundWithStripe('o1')).rejects.toThrow(
			/delivered/
		);

		expect(mockRefundsCreate).not.toHaveBeenCalled();
	});

	it('rejects a cancelled order the warehouse gave to the customer and never refunds the charge', async () => {
		order.warehouseStatus = OrderWarehouseStatus.GivenToCustomer;

		await expect(service.refundWithStripe('o1')).rejects.toThrow(
			/delivered/
		);

		expect(mockRefundsCreate).not.toHaveBeenCalled();
	});

	it.each([
		[
			'carrier issues during delivery',
			{ carrierStatus: OrderCarrierStatus.IssuesDuringDelivery },
		],
		[
			'client refused the order',
			{ carrierStatus: OrderCarrierStatus.ClientRefuseTakingOrder },
		],
		[
			'warehouse allocation failed',
			{ warehouseStatus: OrderWarehouseStatus.AllocationFailed },
		],
		[
			'warehouse packaging failed',
			{ warehouseStatus: OrderWarehouseStatus.PackagingFailed },
		],
	])('refunds a cancelled order once when %s', async (_label, statuses) => {
		Object.assign(order, statuses);

		await expect(service.refundWithStripe('o1')).resolves.toBe(order);

		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledWith({ charge: 'ch_1' });
	});

	it('rejects a cancelled order that has no charge to refund', async () => {
		delete order.stripeChargeId;

		await expect(service.refundWithStripe('o1')).rejects.toThrow(
			/stripeChargeId/
		);

		expect(mockRefundsCreate).not.toHaveBeenCalled();
	});
});
