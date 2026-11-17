import 'reflect-metadata';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: the DBService base is a stub that records what
// `updateById()` would write.
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
	env: { ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: 1 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/auth', () => ({}));

import { AdminsService } from '../../../services/admins/AdminsService';

describe('AdminsService.updateById protected fields', () => {
	const adminId = 'admin-1';

	let service: AdminsService;

	beforeEach(() => {
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockReturnValue(of({ id: adminId, isDeleted: false }));

		service = new AdminsService(
			(() => ({})) as any,
			{ count: () => Promise.resolve(1) } as any
		);
	});

	it('does not write hash, isDeleted or a $ operator', async () => {
		await service.updateById(adminId, {
			name: 'New',
			hash: 'h',
			isDeleted: false,
			$set: { hash: 'h' },
		} as any);

		expect(mockDb.update).toHaveBeenCalledTimes(1);
		expect(mockDb.update.mock.calls[0]).toEqual([adminId, { name: 'New' }]);
	});

	it('does not write a dotted path into hash or the database timestamps', async () => {
		await service.updateById(adminId, {
			firstName: 'First',
			'hash.0': 'h',
			_createdAt: '2020-01-01T00:00:00.000Z',
			_updatedAt: '2020-01-01T00:00:00.000Z',
			$unset: { isDeleted: 1 },
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			adminId,
			{ firstName: 'First' },
		]);
	});

	it('does not change the object the caller passed in', async () => {
		const updateObject = { name: 'New', hash: 'h' } as any;

		await service.updateById(adminId, updateObject);

		expect(updateObject).toEqual({ name: 'New', hash: 'h' });
	});

	it('still writes normal admin fields', async () => {
		await service.updateById(adminId, {
			name: 'New',
			email: 'admin@example.com',
			firstName: 'First',
			lastName: 'Last',
			pictureUrl: 'https://example.com/a.png',
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			adminId,
			{
				name: 'New',
				email: 'admin@example.com',
				firstName: 'First',
				lastName: 'Last',
				pictureUrl: 'https://example.com/a.png',
			},
		]);
	});

	it('refuses an admin that does not exist and writes nothing', async () => {
		mockDb.get.mockReturnValue(of(null));

		await expect(
			service.updateById(adminId, { name: 'New' } as any)
		).rejects.toThrow(`Admin with id '${adminId}' does not exists!`);
		expect(mockDb.update).not.toHaveBeenCalled();
	});
});
