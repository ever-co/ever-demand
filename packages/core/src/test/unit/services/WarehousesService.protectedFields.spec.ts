import 'reflect-metadata';
import { of } from 'rxjs';
import Warehouse from '@modules/server.common/entities/Warehouse';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: the DBService base is a stub that records what `save()`
// would write.
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
	env: { USER_PASSWORD_BCRYPT_SALT_ROUNDS: 1 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));
jest.mock('../../../services/auth', () => ({}));

import { WarehousesService } from '../../../services/warehouses/WarehousesService';

describe('WarehousesService.save protected fields', () => {
	const warehouseId = '5c4f1b3e2d4a1b0012345678';
	// `save` first checks the caller's login token (see
	// WarehousesService.writeAuth.spec.ts); these calls carry the store's own.
	const storeToken = 'store-token';

	let service: WarehousesService;

	// `save` gets what the socket serializer builds: `new Warehouse(input)`,
	// which copies every key of the input onto the entity.
	function serialized(input: object): Warehouse {
		return new Warehouse({
			_id: warehouseId,
			barcodeData: 'code',
			...input,
		} as any);
	}

	function sentToUpdate() {
		expect(mockDb.update).toHaveBeenCalledTimes(1);
		const [id, updateObject] = mockDb.update.mock.calls[0];
		expect(id).toBe(warehouseId);
		expect(updateObject._id.toString()).toBe(warehouseId);
		return updateObject;
	}

	beforeEach(() => {
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockReturnValue(of({ id: warehouseId, isDeleted: false }));

		service = new WarehousesService(
			{} as any,
			(() => ({
				getVerifiedId: (token: string, role: string) =>
					token === storeToken && role === 'warehouse'
						? warehouseId
						: null,
			})) as any
		);
	});

	it('does not write hash, isBanned, isDeleted or a $ operator', async () => {
		await service.save(
			serialized({
				name: 'Store',
				hash: 'h',
				isBanned: false,
				isDeleted: false,
				$set: { hash: 'h' },
			}),
			storeToken
		);

		const updateObject = sentToUpdate();
		expect(Object.keys(updateObject).sort()).toEqual([
			'_id',
			'barcodeData',
			'name',
		]);
		expect(updateObject.name).toBe('Store');
	});

	it('does not write the database timestamps', async () => {
		await service.save(
			serialized({
				name: 'Store',
				_createdAt: '2020-01-01T00:00:00.000Z',
				_updatedAt: '2020-01-01T00:00:00.000Z',
				$unset: { isDeleted: 1 },
			}),
			storeToken
		);

		expect(Object.keys(sentToUpdate()).sort()).toEqual([
			'_id',
			'barcodeData',
			'name',
		]);
	});

	it('still writes normal merchant fields', async () => {
		await service.save(
			serialized({
				name: 'New name',
				isActive: true,
				contactEmail: 'store@example.com',
			}),
			storeToken
		);

		const updateObject = sentToUpdate();
		expect(Object.keys(updateObject).sort()).toEqual([
			'_id',
			'barcodeData',
			'contactEmail',
			'isActive',
			'name',
		]);
		expect(updateObject.name).toBe('New name');
		expect(updateObject.isActive).toBe(true);
		expect(updateObject.contactEmail).toBe('store@example.com');
	});

	it('writes the products as refs (product ids), also when they were read populated', async () => {
		const productId = '5c4f1b3e2d4a1b0012345699';
		const populated = serialized({
			name: 'Store',
			products: [
				{
					_id: '5c4f1b3e2d4a1b00123456aa',
					price: 10,
					initialPrice: 12,
					count: 3,
					product: { _id: productId, title: [], images: [] },
				},
			],
		});

		await service.save(populated, storeToken);

		const written = sentToUpdate().products;
		expect(written).toHaveLength(1);
		expect(written[0].product).toBe(productId);
		expect(written[0].count).toBe(3);
		// the caller's entity keeps its populated product
		expect(typeof populated.products[0].product).toBe('object');
	});
});
