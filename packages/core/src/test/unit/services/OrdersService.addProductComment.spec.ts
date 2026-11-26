import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only addProductComment and its order write are exercised.
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
import { MAX_ORDER_PRODUCT_COMMENT_LENGTH } from '../../../services/orders/orderProductComment';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';

describe('OrdersService.addProductComment', () => {
	let stored: Record<string, any>;
	let update: jest.Mock;
	let service: OrdersService;

	// What a read returns: a copy of the stored order at the time of the read
	const read = () => ({
		...stored,
		id: ORDER_ID,
		products: stored.products.map((p) => ({ ...p })),
	});

	beforeEach(() => {
		stored = {
			_id: ORDER_ID,
			products: [
				{ id: 'line-1', comment: 'old' },
				{ id: 'line-2', comment: 'keep' },
			],
		};

		service = new OrdersService(
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);

		update = jest.fn(async (_id, updateObj) => {
			Object.assign(stored, updateObj);
			return read();
		});

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any)._get = jest.fn(async () => read());
		(service as any).update = update;
		(service as any).get = jest.fn(() => of(read()));
	});

	it('stores the comment on the given line only', async () => {
		const order = await service.addProductComment(
			ORDER_ID,
			'line-2',
			'no onions'
		);

		expect(update).toHaveBeenCalledTimes(1);
		expect(update.mock.calls[0][0]).toBe(ORDER_ID);
		expect(update.mock.calls[0][1].products).toEqual([
			{ id: 'line-1', comment: 'old' },
			{ id: 'line-2', comment: 'no onions' },
		]);
		expect(order.products[1].comment).toBe('no onions');
	});

	it('clears the comment when it is empty', async () => {
		await service.addProductComment(ORDER_ID, 'line-1', '');

		expect(update).toHaveBeenCalledTimes(1);
		expect(stored.products[0].comment).toBe('');
	});

	it('rejects an unknown line with a clear error and writes nothing', async () => {
		await expect(
			service.addProductComment(ORDER_ID, 'removed-line', 'hi')
		).rejects.toThrow(
			`Order ${ORDER_ID} has no product line with the id removed-line!`
		);

		expect(update).not.toHaveBeenCalled();
	});

	it.each([
		['a number', 5],
		['an object', { $set: 'x' }],
		['null', null],
		['too long', 'a'.repeat(MAX_ORDER_PRODUCT_COMMENT_LENGTH + 1)],
	])(
		'rejects a comment that is %s and writes nothing',
		async (_name, comment) => {
			await expect(
				service.addProductComment(ORDER_ID, 'line-1', comment as any)
			).rejects.toThrow('Invalid comment');

			expect(update).not.toHaveBeenCalled();
			expect(stored.products[0].comment).toBe('old');
		}
	);
});
