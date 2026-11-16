import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the charge guard inside `payWithStripe()` is exercised.
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

// Fake payment provider: every `new Stripe()` shares this charges.create.
const mockChargesCreate = jest.fn();
jest.mock('stripe', () => ({
	Stripe: jest.fn().mockImplementation(() => ({
		charges: { create: mockChargesCreate },
		refunds: { create: jest.fn() },
	})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

describe('OrdersService.payWithStripe', () => {
	let service: OrdersService;
	let order: {
		id: string;
		user: { id: string };
		totalPrice: number;
		isPaid: boolean;
		isCancelled: boolean;
	};
	let get: jest.Mock;
	let update: jest.Mock;

	beforeEach(() => {
		mockChargesCreate.mockReset();
		mockChargesCreate.mockResolvedValue({ id: 'ch_1' });

		order = {
			id: 'o1',
			user: { id: 'u1' },
			totalPrice: 19.99,
			isPaid: false,
			isCancelled: false,
		};

		const usersService = {
			get: jest.fn(() => of({ id: 'u1', stripeCustomerId: 'cus_1' })),
		};

		service = new OrdersService(
			{} as any,
			usersService as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		get = jest.fn(() => of(order));
		update = jest.fn(async (_id, updateObj) => ({
			...order,
			...updateObj,
		}));

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any).get = get;
		(service as any).update = update;
	});

	it('rejects an order that is already paid and never charges the card', async () => {
		order.isPaid = true;

		await expect(service.payWithStripe('o1', 'card_1')).rejects.toThrow(
			'Order is already paid'
		);

		expect(mockChargesCreate).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});

	it('rejects a cancelled order and never charges the card', async () => {
		order.isCancelled = true;

		await expect(service.payWithStripe('o1', 'card_1')).rejects.toThrow(
			/cancelled/
		);

		expect(mockChargesCreate).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});

	it('sends an idempotency key for the order and card with the charge', async () => {
		await service.payWithStripe('o1', 'card_1');

		expect(mockChargesCreate).toHaveBeenCalledWith(
			expect.objectContaining({ customer: 'cus_1', source: 'card_1' }),
			{ idempotencyKey: 'order-o1-card-card_1' }
		);
	});

	it('charges an unpaid order once and marks it paid', async () => {
		const paid = await service.payWithStripe('o1', 'card_1');

		expect(mockChargesCreate).toHaveBeenCalledTimes(1);
		expect(mockChargesCreate.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				amount: 1999,
				customer: 'cus_1',
				source: 'card_1',
				metadata: { orderId: 'o1' },
			})
		);
		expect(update).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith('o1', {
			stripeChargeId: 'ch_1',
			isPaid: true,
		});
		expect(paid.isPaid).toBe(true);
	});
});
