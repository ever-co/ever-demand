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

// Fake payment provider: every `new Stripe()` shares these calls.
const mockChargesCreate = jest.fn();
const mockChargesList = jest.fn();
const mockRefundsCreate = jest.fn();
jest.mock('stripe', () => ({
	Stripe: jest.fn().mockImplementation(() => ({
		charges: { create: mockChargesCreate, list: mockChargesList },
		refunds: { create: mockRefundsCreate },
	})),
}));

import {
	ORDER_ALREADY_PAID_ERROR,
	STRIPE_CURRENCY_CHANGED_ERROR,
} from '@modules/server.common/routers/IOrderRouter';
import { env } from '../../../env';
import { OrdersService } from '../../../services/orders/OrdersService';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';
const USER_ID = '5f1a2b3c4d5e6f7a8b9c0d2f';

/**
 * Stand-in for the orders collection holding one order. Its findOneAndUpdate
 * applies the filter the way MongoDB does for the operators used here (plain
 * equality, $ne and $or): a write whose filter does not match changes nothing
 * and resolves to null.
 */
function fakeOrdersModel(stored: Record<string, any>) {
	const matches = (filter: Record<string, any>): boolean =>
		Object.keys(filter).every((key) => {
			const condition = filter[key];

			if (key === '$or') {
				return condition.some(matches);
			}

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

/**
 * A charge as Stripe lists it, with the fields the earlier-charge lookup reads
 */
function listedCharge(fields: {
	id: string;
	orderId: string;
	status?: string;
	refunded?: boolean;
	amountRefunded?: number;
	disputed?: boolean;
	amount?: number;
	currency?: string;
}) {
	return {
		id: fields.id,
		object: 'charge',
		customer: 'cus_1',
		// The test order: 19.99 in ils, the currency when none is configured
		amount: fields.amount === undefined ? 1999 : fields.amount,
		currency: fields.currency || 'ils',
		status: fields.status || 'succeeded',
		paid: (fields.status || 'succeeded') === 'succeeded',
		refunded: fields.refunded === true,
		amount_refunded: fields.amountRefunded || 0,
		disputed: fields.disputed === true,
		metadata: { orderId: fields.orderId },
	};
}

/**
 * One page of charges.list, newest charge first
 */
function chargeList(data: ReturnType<typeof listedCharge>[]) {
	return {
		object: 'list',
		url: '/v1/charges',
		has_more: false,
		data,
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
		// The customer has no earlier charges unless a test says otherwise
		mockChargesList.mockReset();
		mockChargesList.mockResolvedValue(chargeList([]));
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

		// The shop says the order is paid on this error name, not that the
		// payment failed
		await expect(
			service.payWithStripe(ORDER_ID, 'card_1')
		).rejects.toMatchObject({
			name: ORDER_ALREADY_PAID_ERROR,
			message: 'Order is already paid',
		});

		expect(mockChargesCreate).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(model.findOneAndUpdate).not.toHaveBeenCalled();
	});

	it('rejects a cancelled order and never charges the card', async () => {
		stored.isCancelled = true;

		const paying = service.payWithStripe(ORDER_ID, 'card_1');

		await expect(paying).rejects.toThrow(/cancelled/);
		// The shop must not say a cancelled order is paid
		await expect(paying).rejects.not.toMatchObject({
			name: ORDER_ALREADY_PAID_ERROR,
		});

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

	describe('charge currency', () => {
		const mockedEnv = env as { STRIPE_CURRENCY?: string };

		afterEach(() => {
			delete mockedEnv.STRIPE_CURRENCY;
		});

		it('charges in ils when no currency is configured', async () => {
			await service.payWithStripe(ORDER_ID, 'card_1');

			expect(mockChargesCreate.mock.calls[0][0].currency).toBe('ils');
		});

		it('charges in the configured currency, with the amount still in its smallest unit', async () => {
			mockedEnv.STRIPE_CURRENCY = 'usd';

			await service.payWithStripe(ORDER_ID, 'card_1');

			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(mockChargesCreate.mock.calls[0][0]).toEqual(
				expect.objectContaining({ amount: 1999, currency: 'usd' })
			);
			expect(stored.isPaid).toBe(true);
		});

		it('rejects a currency that is not split into 100 minor units before the card is charged', async () => {
			mockedEnv.STRIPE_CURRENCY = 'jpy';

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/not supported/);

			expect(mockChargesCreate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
		});

		it('charges when the shop showed the charge currency', async () => {
			mockedEnv.STRIPE_CURRENCY = 'usd';

			await service.payWithStripe(ORDER_ID, 'card_1', 'USD');

			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(mockChargesCreate.mock.calls[0][0].currency).toBe('usd');
			expect(stored.isPaid).toBe(true);
		});

		it('refuses a charge in another currency than the shop showed, before the card is charged', async () => {
			// The server restarted with another currency while the shop
			// page stayed open.
			mockedEnv.STRIPE_CURRENCY = 'usd';

			// The shop reloads the currency on this error name
			await expect(
				service.payWithStripe(ORDER_ID, 'card_1', 'ILS')
			).rejects.toMatchObject({
				name: STRIPE_CURRENCY_CHANGED_ERROR,
				message:
					'Charge currency is usd, but the customer was shown ILS',
			});

			expect(mockChargesCreate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
		});

		it('serves the charge currency to the shop', async () => {
			await expect(service.getStripeCurrency()).resolves.toBe('ils');

			mockedEnv.STRIPE_CURRENCY = 'usd';

			await expect(service.getStripeCurrency()).resolves.toBe('usd');

			mockedEnv.STRIPE_CURRENCY = 'jpy';

			await expect(service.getStripeCurrency()).rejects.toThrow(
				/not supported/
			);
		});

		it('retries with a new idempotency key after a currency change, and never charges a paid order', async () => {
			// The first attempt gets no answer, so the order stays unpaid.
			mockChargesCreate.mockRejectedValueOnce(
				new Error('socket hang up')
			);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow('socket hang up');

			expect(stored.isPaid).toBe(false);

			// The setting changes before the customer retries with the
			// same card. Reusing the first key with another currency would
			// make Stripe refuse the retry.
			mockedEnv.STRIPE_CURRENCY = 'usd';

			await service.payWithStripe(ORDER_ID, 'card_1');

			expect(mockChargesCreate).toHaveBeenCalledTimes(2);
			expect(mockChargesCreate.mock.calls[0][0].currency).toBe('ils');
			expect(mockChargesCreate.mock.calls[0][1]).toEqual({
				idempotencyKey: `order-${ORDER_ID}-card-card_1`,
			});
			expect(mockChargesCreate.mock.calls[1][0].currency).toBe('usd');
			expect(mockChargesCreate.mock.calls[1][1]).toEqual({
				idempotencyKey: `order-${ORDER_ID}-card-card_1-usd`,
			});
			expect(stored.isPaid).toBe(true);

			// Another change and another tap: the paid order is refused
			// before Stripe is called, whatever the key would be.
			mockedEnv.STRIPE_CURRENCY = 'eur';

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow('Order is already paid');

			expect(mockChargesCreate).toHaveBeenCalledTimes(2);
		});
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
			{
				_id: ORDER_ID,
				isCancelled: { $ne: true },
				$or: [{ isPaid: { $ne: true } }, { stripeChargeId: 'ch_1' }],
			},
			{ stripeChargeId: 'ch_1', isPaid: true },
			{ new: true }
		);
		expect(update).not.toHaveBeenCalled();
		expect(mockRefundsCreate).not.toHaveBeenCalled();
		expect(stored.isPaid).toBe(true);
		expect(stored.stripeChargeId).toBe('ch_1');
		expect(paid.isPaid).toBe(true);
	});

	describe('when an earlier charge of the order may have lost its answer', () => {
		it('pays the order with the earlier charge of another card and does not charge again', async () => {
			// Stripe creates ch_lost, but the answer never arrives (a timeout
			// or a network drop), so the order stays unpaid.
			mockChargesCreate.mockRejectedValueOnce(
				new Error('socket hang up')
			);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow('socket hang up');

			expect(stored.isPaid).toBe(false);

			// The customer retries with a card typed in again, which has a
			// new card id and so a new idempotency key.
			mockChargesList.mockResolvedValue(
				chargeList([
					listedCharge({
						id: 'ch_declined',
						orderId: ORDER_ID,
						status: 'failed',
					}),
					listedCharge({ id: 'ch_other', orderId: 'other-order' }),
					listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
				])
			);

			const paid = await service.payWithStripe(ORDER_ID, 'card_2');

			// Only the first attempt charged a card
			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(stored.stripeChargeId).toBe('ch_lost');
			expect(mockChargesList).toHaveBeenLastCalledWith(
				expect.objectContaining({ customer: 'cus_1' })
			);
			expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{
					_id: ORDER_ID,
					isCancelled: { $ne: true },
					$or: [
						{ isPaid: { $ne: true } },
						{ stripeChargeId: 'ch_lost' },
					],
				},
				{ stripeChargeId: 'ch_lost', isPaid: true },
				{ new: true }
			);
			expect(paid.isPaid).toBe(true);
			expect(stored.isPaid).toBe(true);
			expect(mockRefundsCreate).not.toHaveBeenCalled();
		});

		it('charges again when the earlier charge of the order was refunded', async () => {
			mockChargesList.mockResolvedValue(
				chargeList([
					listedCharge({
						id: 'ch_refunded',
						orderId: ORDER_ID,
						refunded: true,
					}),
				])
			);

			const paid = await service.payWithStripe(ORDER_ID, 'card_2');

			expect(mockChargesList).toHaveBeenCalledTimes(1);
			expect(mockChargesList).toHaveBeenCalledWith(
				expect.objectContaining({ customer: 'cus_1' })
			);
			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			// The lookup comes before the charge
			expect(mockChargesList.mock.invocationCallOrder[0]).toBeLessThan(
				mockChargesCreate.mock.invocationCallOrder[0]
			);
			expect(mockChargesCreate.mock.calls[0][0]).toEqual(
				expect.objectContaining({ source: 'card_2' })
			);
			expect(paid.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).not.toHaveBeenCalled();
		});

		it.each([
			['partly refunded', { amountRefunded: 1000 }],
			['disputed', { disputed: true }],
			['of another amount', { amount: 999 }],
			['in another currency', { currency: 'usd' }],
		])(
			'refuses the payment and does not charge when the earlier charge of the order was %s',
			async (_case, fields) => {
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({
							id: 'ch_lost',
							orderId: ORDER_ID,
							...fields,
						}),
					])
				);

				await expect(
					service.payWithStripe(ORDER_ID, 'card_2')
				).rejects.toThrow(/so it was not charged again/);

				expect(mockChargesCreate).not.toHaveBeenCalled();
				expect(model.findOneAndUpdate).not.toHaveBeenCalled();
				expect(stored.isPaid).toBe(false);
				expect(mockRefundsCreate).not.toHaveBeenCalled();
			}
		);

		it('pays with a whole earlier charge of the order even when an older one was disputed', async () => {
			mockChargesList.mockResolvedValue(
				chargeList([
					listedCharge({ id: 'ch_whole', orderId: ORDER_ID }),
					listedCharge({
						id: 'ch_disputed',
						orderId: ORDER_ID,
						disputed: true,
					}),
				])
			);

			const paid = await service.payWithStripe(ORDER_ID, 'card_2');

			expect(mockChargesCreate).not.toHaveBeenCalled();
			expect(paid.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_whole');
		});

		it('does not list the charges of every customer when the user has no Stripe customer', async () => {
			(service as any).usersService = {
				get: jest.fn(() => of({ id: USER_ID })),
			};

			const paid = await service.payWithStripe(ORDER_ID, 'card_1');

			expect(mockChargesList).not.toHaveBeenCalled();
			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(paid.isPaid).toBe(true);
		});

		it('refuses the payment and does not charge when the earlier charges can not be listed', async () => {
			const listError = new Error('Stripe is unavailable');
			mockChargesList.mockRejectedValue(listError);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_2')
			).rejects.toThrow(/not charged/);

			expect(mockChargesCreate).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({ orderId: ORDER_ID, err: listError }),
				expect.any(String)
			);
		});

		it('refunds the earlier charge when the order is cancelled during the lookup', async () => {
			mockChargesList.mockImplementation(async () => {
				stored.isCancelled = true;

				return chargeList([
					listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
				]);
			});

			await expect(
				service.payWithStripe(ORDER_ID, 'card_2')
			).rejects.toThrow(/cancelled/);

			expect(mockChargesCreate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			// Kept, so refundWithStripe can retry when the refund fails
			expect(stored.stripeChargeId).toBe('ch_lost');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_lost' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_lost` }
			);
		});
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

		it('logs at info, not error, when Stripe says the charge was already refunded', async () => {
			// refundWithStripe from the app refunded the shared charge first
			const alreadyRefunded = {
				type: 'StripeInvalidRequestError',
				code: 'charge_already_refunded',
				message: 'Charge ch_1 has already been refunded.',
			};
			mockRefundsCreate.mockRejectedValue(alreadyRefunded);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/cancelled/);

			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockLog.info).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_1',
					err: alreadyRefunded,
				}),
				expect.any(String)
			);
			expect(mockLog.error).not.toHaveBeenCalledWith(
				expect.objectContaining({ err: alreadyRefunded }),
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

		it('still refunds the charge when reading the order again fails', async () => {
			const readError = new Error('Database is unavailable');
			// The first read is the one before the paid write
			(service as any).getCurrent
				.mockImplementationOnce(async () => read())
				.mockRejectedValueOnce(readError);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toThrow(/cancelled/);

			expect(stored.isPaid).toBe(false);
			// Stored only because the order is unpaid
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).not.toHaveBeenCalled();
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_1',
					err: readError,
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

	describe('when the charge or the paid write fails while the order is cancelled', () => {
		// Stripe made the charge, but the connection dropped before its answer
		const connectionError = Object.assign(
			new Error('An error occurred with our connection to Stripe.'),
			{ type: 'StripeConnectionError' }
		);

		beforeEach(() => {
			// The lookup before the charge finds no earlier charge
			mockChargesList.mockResolvedValueOnce(chargeList([]));
		});

		it('refunds the lost charge once and stores its id when the charge answer is lost', async () => {
			// The customer on another device, or an admin, cancels the order
			// while Stripe is charging: that cancel finds no charge yet.
			mockChargesCreate.mockImplementation(async () => {
				stored.isCancelled = true;
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
					])
				);

				throw connectionError;
			});

			// The caller sees the same error as without the refund
			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(connectionError);

			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(mockChargesList).toHaveBeenCalledTimes(2);
			expect(stored.isCancelled).toBe(true);
			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBe('ch_lost');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_lost' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_lost` }
			);
		});

		it('refunds the charge once and stores its id when the paid write throws', async () => {
			mockChargesCreate.mockImplementation(async () => {
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({ id: 'ch_1', orderId: ORDER_ID }),
					])
				);

				return { id: 'ch_1' };
			});

			// The cancel lands, then the paid write fails (e.g. a timeout)
			const writeError = new Error('Database is unavailable');
			model.findOneAndUpdate.mockImplementationOnce(() => ({
				lean: () => ({
					exec: async () => {
						stored.isCancelled = true;

						throw writeError;
					},
				}),
			}));

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(writeError);

			expect(mockChargesCreate).toHaveBeenCalledTimes(1);
			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_1' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_1` }
			);
		});

		it('looks for a lost charge after a card decline, finds none and refunds nothing', async () => {
			const cardError = Object.assign(
				new Error('Your card was declined.'),
				{ type: 'StripeCardError', code: 'card_declined' }
			);

			mockChargesCreate.mockImplementation(async () => {
				stored.isCancelled = true;
				// Stripe lists the declined charge as failed
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({
							id: 'ch_declined',
							orderId: ORDER_ID,
							status: 'failed',
						}),
					])
				);

				throw cardError;
			});

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(cardError);

			// The lookup before the charge, and the one after the decline
			expect(mockChargesList).toHaveBeenCalledTimes(2);
			expect(mockRefundsCreate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBeUndefined();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
		});

		it('logs a failed read of the order and still rejects with the charge error', async () => {
			mockChargesCreate.mockImplementation(async () => {
				stored.isCancelled = true;

				throw connectionError;
			});

			const readError = new Error('Database is unavailable');
			(service as any).getCurrent.mockRejectedValue(readError);

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(connectionError);

			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({ orderId: ORDER_ID, err: readError }),
				expect.any(String)
			);
			expect(mockRefundsCreate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
		});

		it('leaves an order that is not cancelled alone, so a retry can pay with its charge', async () => {
			mockChargesCreate.mockImplementation(async () => {
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
					])
				);

				throw connectionError;
			});

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(connectionError);

			// Only the lookup before the charge
			expect(mockChargesList).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).not.toHaveBeenCalled();
			expect(stored.isCancelled).toBe(false);
			expect(stored.isPaid).toBe(false);
			expect(stored.stripeChargeId).toBeUndefined();
		});

		it.each([
			['cancelled since', true],
			['not cancelled', false],
		])(
			'refunds the lost charge and keeps the paid one when another card paid the order meanwhile (%s)',
			async (_label, isCancelled) => {
				mockChargesCreate.mockImplementation(async () => {
					// A call with another card paid the order while Stripe
					// was charging this card
					Object.assign(stored, {
						isPaid: true,
						stripeChargeId: 'ch_1',
						isCancelled,
					});
					mockChargesList.mockResolvedValue(
						chargeList([
							listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
							listedCharge({ id: 'ch_1', orderId: ORDER_ID }),
						])
					);

					throw connectionError;
				});

				await expect(
					service.payWithStripe(ORDER_ID, 'card_2')
				).rejects.toBe(connectionError);

				expect(mockChargesList).toHaveBeenCalledTimes(2);
				expect(stored.isPaid).toBe(true);
				expect(stored.stripeChargeId).toBe('ch_1');
				expect(model.findOneAndUpdate).not.toHaveBeenCalled();
				expect(update).not.toHaveBeenCalled();
				expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
				expect(mockRefundsCreate).toHaveBeenCalledWith(
					{ charge: 'ch_lost' },
					{
						idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_lost`,
					}
				);
			}
		);

		it('never refunds the charge the order is paid with when the paid write applied but threw', async () => {
			mockChargesCreate.mockImplementation(async () => {
				mockChargesList.mockResolvedValue(
					chargeList([
						listedCharge({ id: 'ch_1', orderId: ORDER_ID }),
					])
				);

				return { id: 'ch_1' };
			});

			// The write reached the database, but its answer was lost
			const writeError = new Error(
				'Connection to the database was reset'
			);
			model.findOneAndUpdate.mockImplementationOnce(() => ({
				lean: () => ({
					exec: async () => {
						Object.assign(stored, {
							isPaid: true,
							stripeChargeId: 'ch_1',
						});

						throw writeError;
					},
				}),
			}));

			await expect(
				service.payWithStripe(ORDER_ID, 'card_1')
			).rejects.toBe(writeError);

			expect(mockChargesList).toHaveBeenCalledTimes(2);
			expect(stored.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).not.toHaveBeenCalled();
		});
	});

	describe('when two calls pay the order at once', () => {
		// Charges in the order the calls asked for them; each one resolves only
		// when the test says so.
		let pendingCharges: {
			source: string;
			resolve: (charge: { id: string }) => void;
		}[];
		// Resolves once both calls passed the isPaid check and are charging
		let bothCharging: Promise<void>;

		const pendingCharge = (source: string) => {
			const charge = pendingCharges.find((c) => c.source === source);

			if (charge == null) {
				throw new Error(`No pending charge for ${source}`);
			}

			return charge;
		};

		beforeEach(() => {
			pendingCharges = [];

			let onBothCharging: () => void = () => undefined;
			bothCharging = new Promise<void>((resolve) => {
				onBothCharging = resolve;
			});

			mockChargesCreate.mockImplementation(
				({ source }: { source: string }) =>
					new Promise((resolve) => {
						pendingCharges.push({ source, resolve });

						if (pendingCharges.length === 2) {
							onBothCharging();
						}
					})
			);
		});

		it('keeps the first charge of another card and refunds the second one', async () => {
			const first = service.payWithStripe(ORDER_ID, 'card_1');
			const second = service.payWithStripe(ORDER_ID, 'card_2');

			await bothCharging;

			pendingCharge('card_1').resolve({ id: 'ch_1' });
			const paid = await first;

			pendingCharge('card_2').resolve({ id: 'ch_2' });
			// The shop says the order is paid on this error name
			await expect(second).rejects.toMatchObject({
				name: ORDER_ALREADY_PAID_ERROR,
				message: 'Order is already paid',
			});

			expect(mockChargesCreate).toHaveBeenCalledTimes(2);
			expect(paid.isPaid).toBe(true);
			expect(stored.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).not.toHaveBeenCalled();

			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_2' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_2` }
			);
			expect(mockLog.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_2',
				}),
				expect.any(String)
			);
		});

		it('lets two calls with the same card share one charge and refunds nothing', async () => {
			const first = service.payWithStripe(ORDER_ID, 'card_1');
			const second = service.payWithStripe(ORDER_ID, 'card_1');

			await bothCharging;

			// One idempotency key, so Stripe returns the same charge to both calls
			pendingCharges[0].resolve({ id: 'ch_1' });
			const paidFirst = await first;

			pendingCharges[1].resolve({ id: 'ch_1' });
			const paidSecond = await second;

			expect(mockChargesCreate).toHaveBeenCalledTimes(2);
			expect(mockChargesCreate.mock.calls[0][1]).toEqual(
				mockChargesCreate.mock.calls[1][1]
			);
			expect(paidFirst.isPaid).toBe(true);
			expect(paidSecond.isPaid).toBe(true);
			expect(model.findOneAndUpdate).toHaveBeenCalledTimes(2);
			expect(stored.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).not.toHaveBeenCalled();
			expect(mockRefundsCreate).not.toHaveBeenCalled();
		});

		it('still rejects and keeps the first charge when the refund of the second one fails', async () => {
			const refundError = new Error('Stripe is unavailable');
			mockRefundsCreate.mockRejectedValue(refundError);

			const first = service.payWithStripe(ORDER_ID, 'card_1');
			const second = service.payWithStripe(ORDER_ID, 'card_2');

			await bothCharging;

			pendingCharge('card_1').resolve({ id: 'ch_1' });
			await first;

			pendingCharge('card_2').resolve({ id: 'ch_2' });
			await expect(second).rejects.toMatchObject({
				name: ORDER_ALREADY_PAID_ERROR,
				message: 'Order is already paid',
			});

			expect(stored.stripeChargeId).toBe('ch_1');
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_2',
					err: refundError,
				}),
				expect.any(String)
			);
		});

		it('keeps the first charge and refunds the second one when reading the order again fails', async () => {
			const first = service.payWithStripe(ORDER_ID, 'card_1');
			const second = service.payWithStripe(ORDER_ID, 'card_2');

			await bothCharging;

			pendingCharge('card_1').resolve({ id: 'ch_1' });
			await first;

			const readError = new Error('Database is unavailable');
			// The first read is the one before the paid write of ch_2
			(service as any).getCurrent
				.mockImplementationOnce(async () => read())
				.mockRejectedValueOnce(readError);

			pendingCharge('card_2').resolve({ id: 'ch_2' });
			await expect(second).rejects.toThrow('already paid');

			expect(stored.isPaid).toBe(true);
			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).not.toHaveBeenCalled();
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({
					orderId: ORDER_ID,
					chargeId: 'ch_2',
					err: readError,
				}),
				expect.any(String)
			);
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_2' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_2` }
			);
		});

		it('keeps the first charge when the paid order is also cancelled during the second charge', async () => {
			const first = service.payWithStripe(ORDER_ID, 'card_1');
			const second = service.payWithStripe(ORDER_ID, 'card_2');

			await bothCharging;

			pendingCharge('card_1').resolve({ id: 'ch_1' });
			await first;

			// The cancel refunds ch_1 through refundWithStripe, so ch_1 must stay
			stored.isCancelled = true;

			pendingCharge('card_2').resolve({ id: 'ch_2' });
			await expect(second).rejects.toMatchObject({
				name: ORDER_ALREADY_PAID_ERROR,
				message: 'Order is already paid',
			});

			expect(stored.stripeChargeId).toBe('ch_1');
			expect(update).not.toHaveBeenCalled();
			expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_2' },
				{ idempotencyKey: `refund-order-${ORDER_ID}-charge-ch_2` }
			);
		});
	});
});
