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
// One logger shared by every service instance, so a test can read its calls
const mockLog = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => mockLog,
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
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
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
		mockLog.info.mockReset();
		mockLog.warn.mockReset();
		mockLog.error.mockReset();

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

	it('resolves with the order when Stripe says the charge was already refunded', async () => {
		// A repeated cancel (double tap, a lost reply) or payWithStripe
		// refunded this charge before: the customer has the money back.
		const alreadyRefunded = {
			type: 'StripeInvalidRequestError',
			code: 'charge_already_refunded',
			message: 'Charge ch_1 has already been refunded.',
		};
		mockRefundsCreate.mockRejectedValue(alreadyRefunded);

		await expect(service.refundWithStripe('o1')).resolves.toBe(order);

		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledWith({ charge: 'ch_1' });
		expect(mockLog.info).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: 'o1',
				chargeId: 'ch_1',
				err: alreadyRefunded,
			}),
			expect.any(String)
		);
		expect(mockLog.error).not.toHaveBeenCalled();
	});

	it.each([
		[
			'a different Stripe error code',
			{
				type: 'StripeInvalidRequestError',
				code: 'charge_disputed',
				message: 'Charge ch_1 has been charged back.',
			},
		],
		[
			'a Stripe error without a code',
			{
				type: 'StripeConnectionError',
				message: 'Stripe is unavailable',
			},
		],
		['a plain error', new Error('Stripe is unavailable')],
	])('still rejects on %s', async (_label, stripeError) => {
		mockRefundsCreate.mockRejectedValue(stripeError);

		await expect(service.refundWithStripe('o1')).rejects.toBe(stripeError);

		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockLog.error).toHaveBeenCalledWith(
			expect.objectContaining({ orderId: 'o1', err: stripeError }),
			expect.any(String)
		);
	});
});
