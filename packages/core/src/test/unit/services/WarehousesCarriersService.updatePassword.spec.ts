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
	// Listed by warehouse-1 and by warehouse-2 (for example a warehouse that
	// registered itself with a victim's carrier in usedCarriersIds).
	const contestedCarrierId = 'carrier-contested';
	const sharedCarrierId = 'carrier-shared';
	const deletedCarrierId = 'carrier-deleted';
	const missingCarrierId = 'carrier-missing';
	// Listed only by the deleted warehouse.
	const deletedWarehouseCarrierId = 'carrier-of-deleted-warehouse';

	const warehouses: {
		[id: string]: {
			id: string;
			isDeleted: boolean;
			usedCarriersIds: string[];
		};
	} = {
		'warehouse-1': {
			id: 'warehouse-1',
			isDeleted: false,
			usedCarriersIds: [
				ownCarrierId,
				contestedCarrierId,
				sharedCarrierId,
				deletedCarrierId,
				missingCarrierId,
			],
		},
		'warehouse-2': {
			id: 'warehouse-2',
			isDeleted: false,
			usedCarriersIds: [otherCarrierId, contestedCarrierId],
		},
		// A deleted warehouse that still lists carriers. It must not be able
		// to reset them, and its stale list must not block warehouse-1.
		'warehouse-deleted': {
			id: 'warehouse-deleted',
			isDeleted: true,
			usedCarriersIds: [deletedWarehouseCarrierId, ownCarrierId],
		},
	};

	const carriers: {
		[id: string]: {
			id: string;
			isDeleted: boolean;
			isSharedCarrier: boolean;
		};
	} = {
		[ownCarrierId]: {
			id: ownCarrierId,
			isDeleted: false,
			isSharedCarrier: false,
		},
		[otherCarrierId]: {
			id: otherCarrierId,
			isDeleted: false,
			isSharedCarrier: false,
		},
		[contestedCarrierId]: {
			id: contestedCarrierId,
			isDeleted: false,
			isSharedCarrier: false,
		},
		[sharedCarrierId]: {
			id: sharedCarrierId,
			isDeleted: false,
			isSharedCarrier: true,
		},
		[deletedCarrierId]: {
			id: deletedCarrierId,
			isDeleted: true,
			isSharedCarrier: false,
		},
		[deletedWarehouseCarrierId]: {
			id: deletedWarehouseCarrierId,
			isDeleted: false,
			isSharedCarrier: false,
		},
	};

	// Evaluates the one query shape updatePassword sends:
	// { _id: { $ne: warehouseId }, usedCarriersIds: carrierId,
	//   isDeleted: { $ne: true } }
	const countWarehouses = async (filter: any) => {
		const keys = Object.keys(filter).sort().join(',');

		if (
			keys !== '_id,isDeleted,usedCarriersIds' ||
			filter.isDeleted.$ne !== true ||
			typeof filter._id.$ne !== 'string'
		) {
			throw new Error(
				`Unexpected count filter ${JSON.stringify(filter)}`
			);
		}

		return Object.keys(warehouses)
			.map((key) => warehouses[key])
			.filter(
				(w) =>
					w.id !== filter._id.$ne &&
					w.isDeleted !== true &&
					w.usedCarriersIds.indexOf(filter.usedCarriersIds) !== -1
			).length;
	};

	const sign = (payload: object, secret = JWT_SECRET) =>
		jwt.sign(payload, secret, {});

	const warehouse1Token = sign({ id: 'warehouse-1', role: 'warehouse' });
	const warehouse2Token = sign({ id: 'warehouse-2', role: 'warehouse' });

	let authService: AuthService<any>;
	let savePassword: jest.SpyInstance;
	let carriersService: { throwIfNotExists: jest.Mock; getCurrent: jest.Mock };
	let warehousesService: { getCurrent: jest.Mock; count: jest.Mock };
	let service: WarehousesCarriersService;

	beforeEach(() => {
		carriersService = {
			throwIfNotExists: jest.fn(async (id: string) => {
				if (!carriers[id] || carriers[id].isDeleted) {
					throw new Error(`Carrier with id '${id}' does not exists!`);
				}
			}),
			getCurrent: jest.fn(async (id: string) => carriers[id] || null),
		};
		warehousesService = {
			getCurrent: jest.fn(async (id: string) => warehouses[id] || null),
			count: jest.fn(countWarehouses),
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

	// Every refusal gives the same error, so a caller cannot tell which check
	// failed (or whether the carrier exists).
	const expectRefused = async (token: any, carrierId = ownCarrierId) => {
		await expect(
			service.updatePassword(carrierId, 'new-password', token)
		).rejects.toThrow(/^Not authorized to update the carrier password$/);

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
		await expectRefused(warehouse1Token, otherCarrierId);
	});

	it('refuses a valid warehouse token when the warehouse does not exist', async () => {
		await expectRefused(
			sign({ id: 'warehouse-missing', role: 'warehouse' })
		);
		expect(warehousesService.getCurrent).toHaveBeenCalledWith(
			'warehouse-missing'
		);
	});

	it('refuses a deleted warehouse, even for a carrier only it lists', async () => {
		await expectRefused(
			sign({ id: 'warehouse-deleted', role: 'warehouse' }),
			deletedWarehouseCarrierId
		);
	});

	it('refuses a carrier that another warehouse also lists, for both warehouses', async () => {
		await expectRefused(warehouse1Token, contestedCarrierId);
		await expectRefused(warehouse2Token, contestedCarrierId);
	});

	it('refuses a shared carrier', async () => {
		await expectRefused(warehouse1Token, sharedCarrierId);
	});

	it('refuses a carrier that does not exist or is deleted', async () => {
		await expectRefused(warehouse1Token, missingCarrierId);
		await expectRefused(warehouse1Token, deletedCarrierId);
	});

	it('refuses a non-canonical spelling of another store carrier id', async () => {
		// usedCarriersIds holds plain strings and is compared exactly, but the
		// carrier lookup casts the id to an ObjectId, whose hex is
		// case-insensitive. A store that registered itself with the victim's
		// id in upper case must not reach the victim's carrier.
		const victimId = '5f1e2d3c4b5a69788796a5b4';
		const aliasId = victimId.toUpperCase();
		const attackerToken = sign({
			id: 'warehouse-alias',
			role: 'warehouse',
		});

		warehouses['warehouse-victim'] = {
			id: 'warehouse-victim',
			isDeleted: false,
			usedCarriersIds: [victimId],
		};
		warehouses['warehouse-alias'] = {
			id: 'warehouse-alias',
			isDeleted: false,
			usedCarriersIds: [aliasId],
		};
		carriers[victimId] = {
			id: victimId,
			isDeleted: false,
			isSharedCarrier: false,
		};
		carriersService.getCurrent.mockImplementation(
			async (id: string) => carriers[String(id).toLowerCase()] || null
		);

		try {
			await expectRefused(attackerToken, aliasId);
		} finally {
			delete warehouses['warehouse-victim'];
			delete warehouses['warehouse-alias'];
			delete carriers[victimId];
		}
	});

	it("saves the password for the warehouse's own carrier", async () => {
		await expect(
			service.updatePassword(
				ownCarrierId,
				'new-password',
				warehouse1Token
			)
		).resolves.toBeUndefined();

		// Only other warehouses that are not deleted count: the deleted
		// warehouse that still lists this carrier does not block the reset.
		expect(warehousesService.count).toHaveBeenCalledWith({
			_id: { $ne: 'warehouse-1' },
			usedCarriersIds: ownCarrierId,
			isDeleted: { $ne: true },
		});
		expect(savePassword).toHaveBeenCalledTimes(1);
		expect(savePassword).toHaveBeenCalledWith(ownCarrierId, 'new-password');
	});
});
