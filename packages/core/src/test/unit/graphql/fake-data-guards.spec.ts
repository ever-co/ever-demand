import 'reflect-metadata';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the resolver decorators and `clearAll()` itself are
// exercised, so every injected service is a stub.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {},
	ExistenceEventType: { Created: 0, Updated: 1, Removed: 2 },
}));
jest.mock('../../../env', () => ({
	env: { FAKE_DATA_GENERATOR: false },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/admins', () => ({ AdminsService: class {} }));
jest.mock('../../../services/carriers', () => ({ CarriersService: class {} }));
jest.mock('../../../services/carriers/CarriersService', () => ({
	__esModule: true,
	default: class {},
}));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));
jest.mock('../../../services/invites', () => ({
	InvitesRequestsService: class {},
}));
jest.mock('../../../services/invites/InvitesService', () => ({
	InvitesService: class {},
}));
jest.mock('../../../services/orders', () => ({ OrdersService: class {} }));
jest.mock('../../../services/products', () => ({
	ProductsService: class {},
	ProductsCategoriesService: class {},
}));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
}));
jest.mock('../../../services/fake-data/FakeOrdersService', () => ({
	FakeOrdersService: class {},
}));

import { FakeDataGuard } from '../../../auth/guards/fake-data.guard';
import { DataResolver } from '../../../graphql/data/data.resolver';
import { OrderResolver } from '../../../graphql/orders/order.resolver';

// Same key `@UseGuards()` writes to (GUARDS_METADATA in @nestjs/common).
const GUARDS_METADATA = '__guards__';

function guardsOf(resolver: { prototype: any }, method: string) {
	return Reflect.getMetadata(GUARDS_METADATA, resolver.prototype[method]);
}

describe('fake-data queries are behind FakeDataGuard', () => {
	it('FakeDataGuard refuses when FAKE_DATA_GENERATOR is off', () => {
		expect(new FakeDataGuard().canActivate({} as any)).toBe(false);
	});

	it('DataResolver.clearAll', () => {
		expect(guardsOf(DataResolver, 'clearAll')).toContain(FakeDataGuard);
	});

	[
		'generateActiveAndAvailableOrdersPerCarrier',
		'generatePastOrdersPerCarrier',
		'addTakenOrders',
		'addOrdersToTake',
		'generateRandomOrdersCurrentStore',
		'generateOrdersByCustomerId',
	].forEach((method) => {
		it(`OrderResolver.${method}`, () => {
			expect(guardsOf(OrderResolver, method)).toContain(FakeDataGuard);
		});
	});
});

describe('DataResolver.clearAll', () => {
	const SERVICE_COUNT = 10;

	function fakeService(exec: () => Promise<unknown>) {
		const execMock = jest.fn(exec);
		const updateMany = jest.fn(() => ({ exec: execMock }));

		return { Model: { updateMany }, updateMany, exec: execMock };
	}

	function resolverWith(services: ReturnType<typeof fakeService>[]) {
		return new (DataResolver as any)(...services) as DataResolver;
	}

	it('soft-deletes every collection and resolves true', async () => {
		const services = Array.from({ length: SERVICE_COUNT }, () =>
			fakeService(async () => ({ modifiedCount: 1 }))
		);

		await expect(resolverWith(services).clearAll()).resolves.toBe(true);

		services.forEach((service) => {
			expect(service.updateMany).toHaveBeenCalledTimes(1);
			expect(service.updateMany).toHaveBeenCalledWith(
				{},
				{ isDeleted: true }
			);
			expect(service.exec).toHaveBeenCalledTimes(1);
		});
	});

	it('does not resolve before every write has finished', async () => {
		let finishLastWrite: () => void = () => undefined;
		const lastWrite = new Promise<void>((resolve) => {
			finishLastWrite = resolve;
		});

		const services = Array.from({ length: SERVICE_COUNT }, (_, index) =>
			fakeService(() =>
				index === SERVICE_COUNT - 1 ? lastWrite : Promise.resolve()
			)
		);

		let settled = false;
		const result = resolverWith(services)
			.clearAll()
			.then((value) => {
				settled = true;
				return value;
			});

		await new Promise((resolve) => setImmediate(resolve));
		expect(settled).toBe(false);

		finishLastWrite();

		await expect(result).resolves.toBe(true);
	});

	it('rejects when one collection cannot be updated', async () => {
		const services = Array.from({ length: SERVICE_COUNT }, (_, index) =>
			fakeService(() =>
				index === 5
					? Promise.reject(new Error('orders write failed'))
					: Promise.resolve()
			)
		);

		await expect(resolverWith(services).clearAll()).rejects.toThrow(
			'orders write failed'
		);
	});
});
