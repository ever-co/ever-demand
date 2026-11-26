import 'reflect-metadata';
import { of } from 'rxjs';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: a store cancel runs through the real OrdersService, with a
// fake payment provider and a fake orders collection.
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
// OrdersService imports these from the warehouses index...
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
}));
// ...and WarehousesOrdersService from their own files
jest.mock('../../../services/warehouses/WarehousesService', () => ({
	WarehousesService: class {},
}));
jest.mock('../../../services/warehouses/WarehousesProductsService', () => ({
	WarehousesProductsService: class {},
}));
// Only an injection token here: the test hands in the real OrdersService
jest.mock('../../../services/orders', () => ({ OrdersService: class {} }));
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
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
		charges: { create: mockChargesCreate, list: mockChargesList },
		refunds: { create: mockRefundsCreate },
	})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';
import { WarehousesOrdersService } from '../../../services/warehouses/WarehousesOrdersService';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';
const OTHER_ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1f';
const USER_ID = '5f1a2b3c4d5e6f7a8b9c0d2f';
const PRODUCT_ID = '5f1a2b3c4d5e6f7a8b9c0d3a';

/** The key payWithStripe refunds a charge of the order with */
const refundKey = (chargeId: string) =>
	`refund-order-${ORDER_ID}-charge-${chargeId}`;

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
		findById: jest.fn(() => ({
			sort: () => ({
				lean: () => ({ exec: async () => ({ ...stored }) }),
			}),
		})),
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
 * A charge as Stripe lists it, with the fields the cancel reads
 */
function listedCharge(fields: {
	id: string;
	orderId: string;
	status?: string;
	refunded?: boolean;
	amountRefunded?: number;
	amount?: number;
}) {
	return {
		id: fields.id,
		object: 'charge',
		customer: 'cus_1',
		amount: fields.amount === undefined ? 1999 : fields.amount,
		currency: 'ils',
		status: fields.status || 'succeeded',
		paid: (fields.status || 'succeeded') === 'succeeded',
		refunded: fields.refunded === true,
		amount_refunded: fields.amountRefunded || 0,
		disputed: false,
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

describe('WarehousesOrdersService.cancel of an unpaid order with a lost Stripe charge', () => {
	let stored: Record<string, any>;
	let user: { id: string; stripeCustomerId?: string };
	let usersService: { get: jest.Mock };
	let warehousesProductsService: {
		add: jest.Mock;
		decreaseSoldCount: jest.Mock;
	};
	let service: WarehousesOrdersService;

	// What a read returns: a copy of the stored order at the time of the read
	const read = () => ({
		...stored,
		id: stored._id,
		warehouseId: stored.warehouse,
		user: { id: stored.user._id },
	});

	const expectRestocked = () => {
		expect(warehousesProductsService.add).toHaveBeenCalledTimes(1);
		expect(warehousesProductsService.add).toHaveBeenCalledWith('w1', [
			expect.objectContaining({ product: PRODUCT_ID, count: 1 }),
		]);
		expect(
			warehousesProductsService.decreaseSoldCount
		).toHaveBeenCalledWith('w1', PRODUCT_ID, 1);
	};

	beforeEach(() => {
		mockChargesCreate.mockReset();
		mockChargesList.mockReset();
		// payWithStripe got no answer, but Stripe charged the card for the order
		mockChargesList.mockResolvedValue(
			chargeList([
				listedCharge({ id: 'ch_other', orderId: OTHER_ORDER_ID }),
				listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
			])
		);
		mockRefundsCreate.mockReset();
		mockRefundsCreate.mockImplementation(
			async ({ charge }: { charge: string }) => ({
				id: `re_${charge}`,
				charge,
			})
		);
		mockLog.info.mockReset();
		mockLog.warn.mockReset();
		mockLog.error.mockReset();

		stored = {
			_id: ORDER_ID,
			user: { _id: USER_ID },
			warehouse: 'w1',
			totalPrice: 19.99,
			isPaid: false,
			isCancelled: false,
			isConfirmed: true,
			carrierStatus: OrderCarrierStatus.NoCarrier,
			warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
			products: [
				{
					product: { _id: PRODUCT_ID },
					count: 1,
					price: 19.99,
					initialPrice: 19.99,
					deliveryTimeMin: 30,
					deliveryTimeMax: 60,
				},
			],
		};

		user = { id: USER_ID, stripeCustomerId: 'cus_1' };
		usersService = { get: jest.fn(() => of(user)) };

		const ordersService = new OrdersService(
			{} as any,
			usersService as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		(ordersService as any)._throwIfNotExists = jest.fn(
			async () => undefined
		);
		(ordersService as any).get = jest.fn(() => of(read()));
		(ordersService as any).getCurrent = jest.fn(async () => read());
		(ordersService as any).Model = fakeOrdersModel(stored);
		(ordersService as any).existence = { next: jest.fn() };

		warehousesProductsService = {
			add: jest.fn(async () => []),
			decreaseSoldCount: jest.fn(async () => undefined),
		};

		service = new WarehousesOrdersService(
			{} as any,
			{} as any,
			warehousesProductsService as any,
			ordersService,
			usersService as any
		);
	});

	it('refunds the lost charge once, with the payWithStripe refund key, and stores its id on the order', async () => {
		const result = await service.cancel(ORDER_ID);

		expect(result.isCancelled).toBe(true);
		expect(stored.isCancelled).toBe(true);
		expect(stored.isPaid).toBe(false);

		expect(mockChargesList).toHaveBeenCalledTimes(1);
		expect(mockChargesList).toHaveBeenCalledWith({
			customer: 'cus_1',
			limit: 100,
		});

		// Only the charge of this order, never the one of another order
		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledWith(
			{ charge: 'ch_lost' },
			{ idempotencyKey: refundKey('ch_lost') }
		);
		expect(mockChargesCreate).not.toHaveBeenCalled();

		expect(stored.stripeChargeId).toBe('ch_lost');
		expect(mockLog.info).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: ORDER_ID,
				chargeId: 'ch_lost',
				refundId: 're_ch_lost',
			}),
			expect.stringMatching(/refunded/)
		);
		expect(mockLog.error).not.toHaveBeenCalled();

		expectRestocked();
	});

	it('makes no refund on a second cancel of the same order', async () => {
		await service.cancel(ORDER_ID);
		const second = await service.cancel(ORDER_ID);

		expect(second.isCancelled).toBe(true);
		expect(mockChargesList).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledWith(
			{ charge: 'ch_lost' },
			{ idempotencyKey: refundKey('ch_lost') }
		);
		// The stock went back once, by the first cancel
		expectRestocked();
	});

	it('skips a charge of the order that is already refunded, or did not succeed', async () => {
		mockChargesList.mockResolvedValue(
			chargeList([
				listedCharge({
					id: 'ch_refunded',
					orderId: ORDER_ID,
					refunded: true,
					amountRefunded: 1999,
				}),
				listedCharge({
					id: 'ch_failed',
					orderId: ORDER_ID,
					status: 'failed',
				}),
				listedCharge({ id: 'ch_lost', orderId: ORDER_ID }),
			])
		);

		await service.cancel(ORDER_ID);

		expect(mockChargesList).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).toHaveBeenCalledWith(
			{ charge: 'ch_lost' },
			{ idempotencyKey: refundKey('ch_lost') }
		);
		expect(stored.stripeChargeId).toBe('ch_lost');
	});

	it('refunds the rest of a partly refunded charge, whatever its amount', async () => {
		// The order total changed after the charge: still the money of the order
		mockChargesList.mockResolvedValue(
			chargeList([
				listedCharge({
					id: 'ch_partly',
					orderId: ORDER_ID,
					amount: 2599,
					amountRefunded: 600,
				}),
			])
		);

		await service.cancel(ORDER_ID);

		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		// No amount: Stripe refunds what is left of the charge
		expect(mockRefundsCreate).toHaveBeenCalledWith(
			{ charge: 'ch_partly' },
			{ idempotencyKey: refundKey('ch_partly') }
		);
		expect(stored.stripeChargeId).toBe('ch_partly');
	});

	it('makes no Stripe call when the customer has no Stripe customer id, e.g. a cash order', async () => {
		delete user.stripeCustomerId;

		const result = await service.cancel(ORDER_ID);

		expect(result.isCancelled).toBe(true);
		// The cancel looked the customer up and found nothing to refund
		expect(usersService.get).toHaveBeenCalledWith(USER_ID);
		expect(mockChargesList).not.toHaveBeenCalled();
		expect(mockRefundsCreate).not.toHaveBeenCalled();
		expect(stored.stripeChargeId).toBeUndefined();
		expect(mockLog.error).not.toHaveBeenCalled();
		expectRestocked();
	});

	it('still cancels and restocks when Stripe can not list the charges, and logs an error', async () => {
		const err = new Error('Stripe is unreachable');
		mockChargesList.mockRejectedValue(err);

		const result = await service.cancel(ORDER_ID);

		expect(result.isCancelled).toBe(true);
		expect(stored.isCancelled).toBe(true);
		expect(mockChargesList).toHaveBeenCalledTimes(1);
		expect(mockRefundsCreate).not.toHaveBeenCalled();
		expect(mockLog.error).toHaveBeenCalledWith(
			expect.objectContaining({ orderId: ORDER_ID, err }),
			expect.any(String)
		);
		expectRestocked();
	});

	it('still cancels and restocks when Stripe refuses the refund, and logs an error', async () => {
		const err = Object.assign(new Error('Stripe refused the refund'), {
			code: 'api_error',
		});
		mockRefundsCreate.mockRejectedValue(err);

		const result = await service.cancel(ORDER_ID);

		expect(result.isCancelled).toBe(true);
		expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
		// The charge stays on the order, so it can be refunded again by hand
		expect(stored.stripeChargeId).toBe('ch_lost');
		expect(mockLog.error).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: ORDER_ID,
				chargeId: 'ch_lost',
				err,
			}),
			expect.any(String)
		);
		expectRestocked();
	});

	it.each([
		['the first', 'ch_lost_1'],
		['the second', 'ch_lost_2'],
	])(
		'keeps the charge on the order when the refund of %s of two lost charges fails',
		async (_which: string, failingChargeId: string) => {
			mockChargesList.mockResolvedValue(
				chargeList([
					listedCharge({ id: 'ch_lost_1', orderId: ORDER_ID }),
					listedCharge({ id: 'ch_lost_2', orderId: ORDER_ID }),
				])
			);
			const err = Object.assign(new Error('Stripe refused the refund'), {
				code: 'api_error',
			});
			mockRefundsCreate.mockImplementation(
				async ({ charge }: { charge: string }) => {
					if (charge === failingChargeId) {
						throw err;
					}

					return { id: `re_${charge}`, charge };
				}
			);

			const result = await service.cancel(ORDER_ID);

			expect(result.isCancelled).toBe(true);
			expect(mockRefundsCreate).toHaveBeenCalledTimes(2);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_lost_1' },
				{ idempotencyKey: refundKey('ch_lost_1') }
			);
			expect(mockRefundsCreate).toHaveBeenCalledWith(
				{ charge: 'ch_lost_2' },
				{ idempotencyKey: refundKey('ch_lost_2') }
			);
			// The charge still to refund, not the refunded one
			expect(stored.stripeChargeId).toBe(failingChargeId);
			expect(mockLog.error).toHaveBeenCalledWith(
				expect.objectContaining({ chargeId: failingChargeId, err }),
				expect.any(String)
			);
			expectRestocked();
		}
	);

	it('leaves a paid order to refundWithStripe and makes no Stripe call', async () => {
		// The shop asks refundWithStripe to refund a paid order after its cancel
		stored.isPaid = true;
		stored.stripeChargeId = 'ch_paid';

		const result = await service.cancel(ORDER_ID);

		expect(result.isCancelled).toBe(true);
		expect(mockChargesList).not.toHaveBeenCalled();
		expect(mockRefundsCreate).not.toHaveBeenCalled();
		expect(stored.stripeChargeId).toBe('ch_paid');
		expectRestocked();
	});
});
