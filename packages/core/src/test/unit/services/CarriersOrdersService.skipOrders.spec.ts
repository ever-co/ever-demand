import 'reflect-metadata';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the update that `skipOrders()` hands to
// `carriersService.update()` is exercised.
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
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('stripe', () => ({ Stripe: jest.fn() }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
	WarehousesOrdersService: class {},
}));
jest.mock('../../../services/geo-locations', () => ({
	GeoLocationsOrdersService: class {},
}));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/carriers/CarriersService', () => ({
	__esModule: true,
	default: class {},
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));

import { CarriersOrdersService } from '../../../services/carriers/CarriersOrdersService';

describe('CarriersOrdersService.skipOrders', () => {
	const carrierId = 'carrier-1';
	const orderId = '5c4f1b3e2d4a1b0012345678';
	const otherOrderId = '5C4F1B3E2D4A1B0012345679';

	let service: CarriersOrdersService;
	let update: jest.Mock;

	beforeEach(() => {
		update = jest.fn(async () => ({ id: carrierId }));

		const carriersService = {
			throwIfNotExists: jest.fn(async () => undefined),
			update,
		};

		service = new CarriersOrdersService(
			carriersService as any,
			{} as any,
			{} as any,
			{} as any,
			{} as any
		);
	});

	it('rejects an id that is not an ObjectId and names it', async () => {
		await expect(service.skipOrders(carrierId, ['x'])).rejects.toThrow(
			"'x'"
		);

		expect(update).not.toHaveBeenCalled();
	});

	it('rejects the whole call when one of the ids is bad', async () => {
		await expect(
			service.skipOrders(carrierId, [orderId, 'twelve-chars'])
		).rejects.toThrow("'twelve-chars'");

		expect(update).not.toHaveBeenCalled();
	});

	it('rejects ids that are not sent as a list', async () => {
		await expect(
			service.skipOrders(carrierId, orderId as any)
		).rejects.toThrow();

		expect(update).not.toHaveBeenCalled();
	});

	it('adds valid ids with $addToSet, so an order is never stored twice', async () => {
		await service.skipOrders(carrierId, [orderId, otherOrderId]);

		expect(update).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith(carrierId, {
			$addToSet: {
				skippedOrderIds: {
					$each: [orderId, otherOrderId.toLowerCase()],
				},
			},
		});
	});

	it('stores ids in lower case, so another spelling is not stored twice', async () => {
		await service.skipOrders(carrierId, [orderId.toUpperCase()]);

		expect(update).toHaveBeenCalledWith(carrierId, {
			$addToSet: { skippedOrderIds: { $each: [orderId] } },
		});
	});
});
