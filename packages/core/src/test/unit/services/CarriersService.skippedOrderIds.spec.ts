import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: the DBService base is a stub that records what
// `register()` and `updateById()` would write.
const mockDb = {
	create: jest.fn(),
	update: jest.fn(),
	get: jest.fn(),
};

jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {
		create(createObject) {
			return mockDb.create(createObject);
		}
		update(id, updateObject) {
			return mockDb.update(id, updateObject);
		}
		get(id) {
			return mockDb.get(id);
		}
	},
}));
jest.mock('../../../env', () => ({
	env: { CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: 1 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/auth', () => ({}));

import { CarriersService } from '../../../services/carriers/CarriersService';

describe('CarriersService skippedOrderIds input', () => {
	const carrierId = 'carrier-1';
	const orderId = '5c4f1b3e2d4a1b0012345678';

	let service: CarriersService;

	beforeEach(() => {
		mockDb.create.mockReset();
		mockDb.create.mockImplementation(async (obj) => obj);
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockReturnValue(of({ id: carrierId }));

		service = new CarriersService((() => ({
			getPasswordHash: async () => 'hash',
		})) as any);
	});

	function registerInput(skippedOrderIds?: any) {
		return {
			carrier: {
				firstName: 'First',
				lastName: 'Last',
				username: 'carrier',
				...(skippedOrderIds === undefined ? {} : { skippedOrderIds }),
			},
			password: 'secret',
		} as any;
	}

	it('register rejects a bad skipped order id and names it', async () => {
		await expect(
			service.register(registerInput([orderId, 'x']))
		).rejects.toThrow("'x'");

		expect(mockDb.create).not.toHaveBeenCalled();
	});

	it('register still creates a carrier with valid or no skipped ids', async () => {
		await service.register(registerInput([orderId]));
		await service.register(registerInput());

		expect(mockDb.create).toHaveBeenCalledTimes(2);
		expect(mockDb.create.mock.calls[0][0].skippedOrderIds).toEqual([
			orderId,
		]);
	});

	it('updateById rejects a bad skipped order id and names it', async () => {
		await expect(
			service.updateById(carrierId, {
				skippedOrderIds: ['twelve-chars'],
			})
		).rejects.toThrow("'twelve-chars'");

		expect(mockDb.update).not.toHaveBeenCalled();
	});

	it('updateById still updates other fields and valid skipped ids', async () => {
		await service.updateById(carrierId, { firstName: 'New' });
		await service.updateById(carrierId, { skippedOrderIds: [orderId] });

		expect(mockDb.update).toHaveBeenCalledTimes(2);
		expect(mockDb.update.mock.calls[1]).toEqual([
			carrierId,
			{ skippedOrderIds: [orderId] },
		]);
	});
});
