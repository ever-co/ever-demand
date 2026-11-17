import 'reflect-metadata';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'unit-test-jwt-secret';

// Keep the heavy service graph (mongoose models, router wiring, bcrypt) out of
// this unit test. The real AuthService and jsonwebtoken check the tokens; only
// the password write (`_savePassword`) is replaced with a spy.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server/entity-service', () => ({
	EntityService: class {},
}));
jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('../../../env', () => ({
	env: {
		JWT_SECRET: 'unit-test-jwt-secret',
		CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: 1,
	},
}));
jest.mock('../../../services/carriers', () => ({ CarriersService: class {} }));
jest.mock('../../../services/warehouses/WarehousesService', () => ({
	WarehousesService: class {},
}));
jest.mock('../../../services/auth', () => ({
	AuthService: jest.requireActual('../../../services/auth/AuthService')
		.AuthService,
}));

import { AuthService } from '../../../services/auth/AuthService';
import { WarehousesCarriersService } from '../../../services/warehouses/WarehousesCarriersService';

describe('WarehousesCarriersService.updatePassword', () => {
	const ownCarrierId = 'carrier-own';
	const otherCarrierId = 'carrier-other';

	const warehouses = {
		'warehouse-1': {
			id: 'warehouse-1',
			isDeleted: false,
			usedCarriersIds: [ownCarrierId],
		},
		'warehouse-2': {
			id: 'warehouse-2',
			isDeleted: false,
			usedCarriersIds: [otherCarrierId],
		},
	};

	const sign = (payload: object, secret = JWT_SECRET) =>
		jwt.sign(payload, secret, {});

	const warehouse1Token = sign({ id: 'warehouse-1', role: 'warehouse' });

	let authService: AuthService<any>;
	let savePassword: jest.SpyInstance;
	let carriersService: { throwIfNotExists: jest.Mock };
	let warehousesService: { getCurrent: jest.Mock };
	let service: WarehousesCarriersService;

	beforeEach(() => {
		carriersService = { throwIfNotExists: jest.fn(async () => undefined) };
		warehousesService = {
			getCurrent: jest.fn(async (id: string) => warehouses[id] || null),
		};

		const authServiceFactory = (config) => {
			authService = new AuthService<any>();
			authService.setConfig(config);
			savePassword = jest
				.spyOn(authService, '_savePassword')
				.mockResolvedValue(undefined);
			return authService;
		};

		service = new WarehousesCarriersService(
			carriersService as any,
			warehousesService as any,
			authServiceFactory as any
		);
	});

	const expectRefused = async (token: any) => {
		await expect(
			service.updatePassword(ownCarrierId, 'new-password', token)
		).rejects.toThrow();

		expect(savePassword).not.toHaveBeenCalled();
	};

	it('refuses a call without a token', async () => {
		await expectRefused(undefined);
		await expectRefused(null);
		await expectRefused('');
	});

	it('refuses a token that is not a valid login token', async () => {
		await expectRefused('not-a-jwt');
		await expectRefused(
			sign({ id: 'warehouse-1', role: 'warehouse' }, 'another-secret')
		);
	});

	it('refuses a carrier login token', async () => {
		await expectRefused(sign({ id: ownCarrierId, role: 'carrier' }));
	});

	it("refuses another warehouse's token", async () => {
		await expectRefused(sign({ id: 'warehouse-2', role: 'warehouse' }));
	});

	it('refuses a warehouse token for a carrier the warehouse does not use', async () => {
		await expect(
			service.updatePassword(
				otherCarrierId,
				'new-password',
				warehouse1Token
			)
		).rejects.toThrow();

		expect(savePassword).not.toHaveBeenCalled();
	});

	it("saves the password for the warehouse's own carrier", async () => {
		await expect(
			service.updatePassword(
				ownCarrierId,
				'new-password',
				warehouse1Token
			)
		).resolves.toBeUndefined();

		expect(savePassword).toHaveBeenCalledTimes(1);
		expect(savePassword).toHaveBeenCalledWith(ownCarrierId, 'new-password');
	});
});
