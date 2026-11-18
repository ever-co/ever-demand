import 'reflect-metadata';
import { EMPTY } from 'rxjs';
import { first } from 'rxjs/operators';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the filters that `getMerchants()` and `get()` hand to
// `warehousesService.Model.find()` are exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	ExistenceEventType: { Created: 0, Updated: 1, Removed: 2 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
}));

import { GeoLocationsWarehousesService } from '../../../services/geo-locations/GeoLocationsWarehousesService';

describe('GeoLocationsWarehousesService hides deleted stores', () => {
	const geoLocation = {
		loc: { type: 'Point', coordinates: [23.32, 42.69] },
	} as any;

	let service: GeoLocationsWarehousesService;
	let filters: any[];

	beforeEach(() => {
		filters = [];

		// Deleting a store is a soft delete (`isDeleted: true`), so the
		// nearby-store queries have to leave those documents out themselves.
		const find = jest.fn((filter: any) => {
			filters.push(filter);

			const chain: any = {
				populate: jest.fn(() => chain),
				lean: jest.fn(() => chain),
				exec: jest.fn(async () => []),
			};

			return chain;
		});

		const warehousesService = {
			Model: { find },
			existence: EMPTY,
		};

		service = new GeoLocationsWarehousesService(warehousesService as any);
	});

	it('getMerchants leaves deleted stores out', async () => {
		await service.getMerchants(
			geoLocation,
			GeoLocationsWarehousesService.TrackingDistance,
			{ fullProducts: false, activeOnly: true }
		);

		expect(filters).toHaveLength(1);
		expect(filters[0].isDeleted).toEqual({ $eq: false });
	});

	it('get (nearbyStores) leaves deleted stores out', async () => {
		await service.get(geoLocation).pipe(first()).toPromise();

		expect(filters).toHaveLength(1);
		expect(filters[0].isDeleted).toEqual({ $eq: false });
	});
});
