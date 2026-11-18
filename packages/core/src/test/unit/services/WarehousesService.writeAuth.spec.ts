import 'reflect-metadata';
import jwt from 'jsonwebtoken';
import { of } from 'rxjs';
import Warehouse from '@modules/server.common/entities/Warehouse';

const JWT_SECRET = 'unit-test-jwt-secret';

// Keep the heavy service graph (mongoose models, router wiring, bcrypt) out of
// this unit test. The DBService base is a stub that records what the
// listeners would write; the real AuthService and jsonwebtoken check tokens.
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
jest.mock('@pyro/db-server/entity-service', () => ({
	EntityService: class {},
}));
jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('../../../env', () => ({
	env: {
		JWT_SECRET: 'unit-test-jwt-secret',
		USER_PASSWORD_BCRYPT_SALT_ROUNDS: 1,
	},
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));
jest.mock('../../../services/auth', () => ({}));

import { AuthService } from '../../../services/auth/AuthService';
import { WarehousesService } from '../../../services/warehouses/WarehousesService';

describe('WarehousesService write listeners require a login token', () => {
	const storeId = '5c4f1b3e2d4a1b0012345678';
	const otherStoreId = '5c4f1b3e2d4a1b0087654321';

	const sign = (payload: object, secret = JWT_SECRET) =>
		jwt.sign(payload, secret, {});

	const base64url = (value: object) =>
		Buffer.from(JSON.stringify(value))
			.toString('base64')
			.replace(/=+$/, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');

	const storeToken = sign({ id: storeId, role: 'warehouse' });
	const adminToken = sign({ id: 'admin-1', role: 'admin' });

	const geoLocation = {
		loc: { type: 'Point', coordinates: [23.3, 42.7] },
		countryId: 1,
		city: 'Sofia',
		postcode: '1000',
		streetAddress: 'Main',
		house: '1',
	} as any;

	// `save` gets what the socket serializer builds: `new Warehouse(input)`.
	const serialized = (id: string) =>
		new Warehouse({
			_id: id,
			barcodeData: 'code',
			name: 'New name',
			usedCarriersIds: ['carrier-of-the-caller'],
		} as any);

	// Each listener, called for `id` with `token`, and the write it makes
	// when the call is allowed.
	const listeners: Array<{
		name: string;
		call: (
			service: WarehousesService,
			id: string,
			token: any
		) => Promise<Warehouse>;
		expectWritten: (id: string) => void;
	}> = [
		{
			name: 'save',
			call: (service, id, token) => service.save(serialized(id), token),
			expectWritten: (id) => {
				expect(mockDb.update).toHaveBeenCalledTimes(1);
				const [updatedId, updateObject] = mockDb.update.mock.calls[0];
				expect(updatedId).toBe(id);
				expect(updateObject.name).toBe('New name');
			},
		},
		{
			name: 'updateGeoLocation',
			call: (service, id, token) =>
				service.updateGeoLocation(id, geoLocation, token),
			expectWritten: (id) => {
				expect(mockDb.update).toHaveBeenCalledTimes(1);
				expect(mockDb.update).toHaveBeenCalledWith(id, { geoLocation });
			},
		},
		{
			name: 'updateAvailability',
			call: (service, id, token) =>
				service.updateAvailability(id, false, token),
			expectWritten: (id) => {
				expect(mockDb.update).toHaveBeenCalledTimes(1);
				expect(mockDb.update).toHaveBeenCalledWith(id, {
					isActive: false,
				});
			},
		},
	];

	let service: WarehousesService;

	beforeEach(() => {
		mockDb.update.mockReset();
		mockDb.update.mockImplementation(async (_id, obj) => obj);
		mockDb.get.mockReset();
		mockDb.get.mockImplementation((id) => of({ id, isDeleted: false }));

		const authServiceFactory = (config) => {
			const authService = new AuthService<any>();
			authService.setConfig(config);
			return authService;
		};

		service = new WarehousesService({} as any, authServiceFactory as any);
	});

	listeners.forEach((listener) =>
		describe(listener.name, () => {
			// Every refusal gives the same error, and it comes before the
			// store is looked up, so a caller learns nothing about which
			// check failed or whether the store exists.
			const expectRefused = async (token: any, id = storeId) => {
				await expect(listener.call(service, id, token)).rejects.toThrow(
					/^Not authorized to update the store$/
				);

				expect(mockDb.update).not.toHaveBeenCalled();
				expect(mockDb.get).not.toHaveBeenCalled();
			};

			it('refuses a call without a token', async () => {
				await expectRefused(undefined);
				await expectRefused(null);
				await expectRefused('');
			});

			it('refuses a token that is not a valid login token', async () => {
				await expectRefused('not-a-jwt');
				await expectRefused({ id: storeId, role: 'warehouse' });
				await expectRefused(
					sign({ id: storeId, role: 'warehouse' }, 'another-secret')
				);
				await expectRefused(
					sign({ id: 'admin-1', role: 'admin' }, 'another-secret')
				);
				// An unsigned token ("alg": "none") for the store.
				await expectRefused(
					`${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({
						id: storeId,
						role: 'warehouse',
					})}.`
				);
			});

			it('refuses a carrier or customer login token, even with the store id', async () => {
				await expectRefused(sign({ id: storeId, role: 'carrier' }));
				await expectRefused(sign({ id: storeId, role: 'user' }));
			});

			it("refuses another store's token", async () => {
				await expectRefused(
					sign({ id: otherStoreId, role: 'warehouse' })
				);
				// The caller's own token does not open another store.
				await expectRefused(storeToken, otherStoreId);
			});

			it("accepts the store's own token", async () => {
				await expect(
					listener.call(service, storeId, storeToken)
				).resolves.toBeDefined();

				listener.expectWritten(storeId);
			});

			it('accepts an admin token', async () => {
				await expect(
					listener.call(service, storeId, adminToken)
				).resolves.toBeDefined();

				listener.expectWritten(storeId);
			});
		})
	);
});
