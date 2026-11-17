import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: the DBService base is a stub that records what
// `updateUser()` would write.
const mockDb = {
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
		update(id, updateObject) {
			return mockDb.update(id, updateObject);
		}
		get(id) {
			return mockDb.get(id);
		}
	},
}));
jest.mock('../../../env', () => ({
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/invites', () => ({ InvitesService: class {} }));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
}));
jest.mock('stripe', () => ({ Stripe: jest.fn() }));

import { UsersService } from '../../../services/users/UsersService';

describe('UsersService.updateUser protected fields', () => {
	const userId = 'user-1';

	let service: UsersService;

	beforeEach(() => {
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockReturnValue(of({ id: userId, isDeleted: false }));

		service = new UsersService({} as any, {} as any, {} as any);
	});

	it('does not write hash, isBanned, isDeleted or a $ operator', async () => {
		await service.updateUser(userId, {
			firstName: 'New',
			hash: 'h',
			isBanned: false,
			isDeleted: false,
			$set: { hash: 'h' },
		} as any);

		expect(mockDb.update).toHaveBeenCalledTimes(1);
		expect(mockDb.update.mock.calls[0]).toEqual([
			userId,
			{ firstName: 'New' },
		]);
	});

	it('does not write the database timestamps', async () => {
		await service.updateUser(userId, {
			lastName: 'Last',
			_createdAt: '2020-01-01T00:00:00.000Z',
			_updatedAt: '2020-01-01T00:00:00.000Z',
			$unset: { isBanned: 1 },
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			userId,
			{ lastName: 'Last' },
		]);
	});

	it('still writes normal customer fields', async () => {
		await service.updateUser(userId, {
			firstName: 'New',
			email: 'new@example.com',
			apartment: '7',
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			userId,
			{ firstName: 'New', email: 'new@example.com', apartment: '7' },
		]);
	});
});
