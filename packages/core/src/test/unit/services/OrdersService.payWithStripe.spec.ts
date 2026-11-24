import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the charge guard inside `payWithStripe()` is exercised.
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

// Fake payment provider: every `new Stripe()` shares these two calls.
const mockChargesCreate = jest.fn();
const mockRefundsCreate = jest.fn();
jest.mock('stripe', () => ({
	Stripe: jest.fn().mockImplementation(() => ({
		charges: { create: mockChargesCreate },
		refunds: { create: mockRefundsCreate },
	})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';
const USER_ID = '5f1a2b3c4d5e6f7a8b9c0d2f';

/**
 * Stand-in for the orders collection holding one order. Its findOneAndUpdate
 * applies the filter the way MongoDB does for the operators used here (plain
 * equality and $ne): a write whose filter does not match changes nothing and
 * resolves to null.
 */
function fakeOrdersModel(stored: Record<string, any>) {
	const matches = (filter: Record<string, any>) =>
		Object.keys(filter).every((key) => {
			const condition = filter[key];

			return condition != null &&
				typeof condition === 'object' &&
				'$ne' in condition
				? stored[key] !== condition.$ne
				: String(stored[key]) === String(condition);
		});

	return {
		findOneAndUpdate: jest.fn((filter: any, updateObj: any) => ({
			lean: () => ({
				exec: async () => {
					if (!matches(filter)) {
						return null;
					}

					Object.assign(stored, updateObj);

					return { ...stored };
				},
			}),
		})),
	};
}

describe('OrdersService.payWithStripe', () => {
	let service: OrdersService;
	let stored: Record<string, any>;
	let model: ReturnType<typeof fakeOrdersModel>;
	let get: jest.Mock;
	let update: jest.Mock;

	// What a read returns: a copy of the stored order at the time of the read
	const read = () => ({
		...stored,
		id: stored._id,
		user: { id: stored.user._id },
	});

	beforeEach(() => {
		mockChargesCreate.mockReset();
		mockChargesCreate.mockResolvedValue({ id: 'ch_1' });
		mockRefundsCreate.mockReset();
		mockRefundsCreate.mockResolvedValue({ id: 're_1' });
		mockLog.info.mockReset();
		mockLog.warn.mockReset();
		mockLog.error.mockReset();

		stored = {
			_id: ORDER_ID,
			user: { _id: USER_ID },
			totalPrice: 19.99,
			isPaid: false,
			isCancelled: false,
		};

		model = fakeOrdersModel(stored);

		const usersService = {
			get: jest.fn(() => of({ id: USER_ID, stripeCustomerId: 'cus_1' })),
		};

		service = new OrdersService(
			{} as any,
			usersService as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		get = jest.fn(() => of(read()));
		// The unconditional write: it applies to the stored order whatever its state
		update = jest.fn(async (_id, updateObj) => {
			Object.assign(stored, updateObj);

			return read();
		});

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any).get = get;
		(service as any).getCurrent = jest.fn(async () => read());
		(service as any).update = update;
		(service as any).Model = model;
		(service as any).existence = { next: jest.fn() };
	});

	it('rejects an order that is already paid and never charges the card', async () => {
		stored.isPaid = true;

		await expect(service.payWithStripe(ORDER_ID, 'card_1')).rejects.toThrow(
			'Order is already paid'
		);

		expect(mockChargesCreate).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(model.findOneAndUpdate).not.toHaveBeenCalled();
	});

	it('rejects a cancelled order and never charges the card', async () => {
		stored.isCancelled = true;

		await expect(service.payWithStripe(ORDER_ID, 'card_1')).rejects.toThrow(
			/cancelled/
		);

		expect(mockChargesCreate).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(model.findOneAndUpdate).not.toHaveBeenCalled();
	});

	it('sends an idempotency key for the order and card with the charge', async () => {
		await service.payWithStripe(ORDER_ID, 'card_1');

		expect(mockChargesCreate).toHaveBeenCalledWith(
			expect.objectContaining({ customer: 'cus_1', source: 'card_1' }),
			{ idempotencyKey: `order-${ORDER_ID}-card-card_1` }
		);
	});

	it('charges an unpaid order once and marks it paid only while it is not cancelled', async () => {
		const paid = await service.payWithStripe(ORDER_ID, 'card_1');

		expect(mockChargesCreate).toHaveBeenCalledTimes(1);
		expect(mockChargesCreate.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				amount: 1999,
				customer: 'cus_1',
				source: 'card_1',
				metadata: { orderId: ORDER_ID },
			})
		);
		expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
		expect(model.findOneAndUpdate).toHaveBeenCalledWith(
			{ _id: ORDER_ID, isCancelled: { $ne: true } },
			{ stripeChargeId: 'ch_1', isPaid: true },
			{ new: true }
		);
		expect(update).not.toHaveBeenCalled();
		expect(mockRefundsCreate).not.toHaveBeenCalled();
		expect(stored.isPaid).toBe(true);
		expect(stored.stripeChargeId).toBe('ch_1');
		expect(paid.isPaid).toBe(true);
	});

	describe('when the order is cancelled while Stripe is charging', () => {
		beforeEach(() => {
			// Another device, the store or an admin cancels the order after the
			// check in payWithStripe and before the charge resolves.
			mockChargesCreate.mockImplementation(async () => {
				stored.isCancelled = true;

				return { id: 'ch_1' };
			});
		});

		it('does not mark the order paid, keeps the charge id and refunds the charge once', async () => {
			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/cancelled/);

			expect(stored.isCancelled).toBe(true);
			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).toHaveBeenCalledTimes(1);
			expect(update).toHaveBeenCalledWith(ORDER_ID, {
				stripeChargeId: 'ch_1',
			});

			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_1' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_1` }
			);
			expect(mockLog.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_1',
				}),
				expect.any(String)
			);
		});

		it('still rejects and keeps the charge id when the refund fails', async () => {
			const refundError = new Error('Stripe is unavailable');
			mockRefundsCreate.mockRejectedValue(refundError);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/cancelled/);

			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_1',
					err: refundError,
				}),
				expect.any(String)
			);
		});

		it('still refunds the charge when storing its id fails', async () => {
			const storeError = new Error('Database is unavailable');
			update.mockRejectedValue(storeError);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/cancelled/);

			expect(stored.isPaid).toBe(false);
			expect(update).toHaveBeenCalledTimes(1);
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_1',
					err: storeError,
				}),
				expect.any(String)
			);
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_1' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_1` }
			);
		});
	});
});
