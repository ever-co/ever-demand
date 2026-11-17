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
	env: { CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: 1 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/auth', () => ({}));

import { CarriersService } from '../../../services/carriers/CarriersService';

describe('CarriersService.updateById protected fields', () => {
	const carrierId = 'carrier-1';

	let service: CarriersService;

	beforeEach(() => {
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockReturnValue(of({ id: carrierId, isDeleted: false }));

		service = new CarriersService((() => ({})) as any);
	});

	it('does not write hash, isBanned, isDeleted or a $ operator', async () => {
		await service.updateById(carrierId, {
			firstName: 'New',
			hash: 'h',
			isBanned: false,
			isDeleted: false,
			$set: { hash: 'h' },
		} as any);

		expect(mockDb.update).toHaveBeenCalledTimes(1);
		expect(mockDb.update.mock.calls[0]).toEqual([
			carrierId,
			{ firstName: 'New' },
		]);
	});

	it('does not write the database timestamps', async () => {
		await service.updateById(carrierId, {
			lastName: 'Last',
			_createdAt: '2020-01-01T00:00:00.000Z',
			_updatedAt: '2020-01-01T00:00:00.000Z',
			$unset: { isDeleted: 1 },
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			carrierId,
			{ lastName: 'Last' },
		]);
	});

	it('still writes normal carrier fields', async () => {
		await service.updateById(carrierId, {
			firstName: 'New',
			phone: '555',
			isActive: true,
		} as any);

		expect(mockDb.update.mock.calls[0]).toEqual([
			carrierId,
			{ firstName: 'New', phone: '555', isActive: true },
		]);
	});
});
