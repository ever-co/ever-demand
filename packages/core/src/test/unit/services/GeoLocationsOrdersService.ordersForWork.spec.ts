import 'reflect-metadata';
import { ObjectId } from 'bson';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the aggregate pipelines that `getOrdersForWork()` and
// `getCountOfOrdersForWork()` hand to `ordersService.Model.aggregate()` are
// exercised.
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
jest.mock('../../../services/orders', () => ({ OrdersService: class {} }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
	WarehousesOrdersService: class {},
}));
jest.mock(
	'../../../services/geo-locations/GeoLocationsWarehousesService',
	() => ({
		GeoLocationsWarehousesService: class {
			static TrackingDistance = 50000;
			static isNearly = () => true;
		},
	})
);

import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { GeoLocationsOrdersService } from '../../../services/geo-locations/GeoLocationsOrdersService';

describe('GeoLocationsOrdersService work queries', () => {
	const geoLocation = {
		loc: { type: 'Point', coordinates: [23.32, 42.69] },
	} as any;

	const skippedOrderIds = [
		'5c4f1b3e2d4a1b0012345678',
		'5c4f1b3e2d4a1b0012345679',
	];

	let service: GeoLocationsOrdersService;
	let pipelines: any[][];

	// The `$match` stage at the top level of the recorded pipeline: the one
	// that decides which orders reach the sort and the page.
	const topLevelMatch = (pipeline: any[]) =>
		pipeline.find((stage) => stage.$match !== undefined).$match;

	beforeEach(() => {
		pipelines = [];

		const aggregate = jest.fn((pipeline: any[]) => {
			pipelines.push(pipeline);

			const rows: any[] = [];
			const chain: any = {
				allowDiskUse: jest.fn(() => chain),
				skip: jest.fn(() => chain),
				limit: jest.fn(() => chain),
				exec: jest.fn(async () => rows),
				then: (resolve, reject) =>
					Promise.resolve(rows).then(resolve, reject),
			};

			return chain;
		});

		const ordersService = { Model: { aggregate } };
		const geoLocationsWarehousesService = {
			getMerchants: jest.fn(async () => [{ _id: 'warehouse-1' }]),
		};

		service = new GeoLocationsOrdersService(
			ordersService as any,
			{} as any,
			geoLocationsWarehousesService as any,
			{} as any,
			{} as any
		);
	});

	it('getOrdersForWork keeps takeaway orders out before it pages', async () => {
		await service.getOrdersForWork(
			geoLocation,
			skippedOrderIds,
			{ sort: 'asc' },
			{ isCancelled: false }
		);

		expect(pipelines).toHaveLength(1);
		expect(topLevelMatch(pipelines[0]).orderType).toBe(
			DeliveryType.Delivery
		);
	});

	it('getCountOfOrdersForWork counts only delivery orders', async () => {
		await service.getCountOfOrdersForWork(geoLocation, skippedOrderIds);

		expect(pipelines).toHaveLength(1);
		expect(topLevelMatch(pipelines[0]).orderType).toBe(
			DeliveryType.Delivery
		);
	});

	it('getCountOfOrdersForWork matches skipped orders by ObjectId', async () => {
		await service.getCountOfOrdersForWork(geoLocation, skippedOrderIds);

		const excluded = topLevelMatch(pipelines[0])._id.$nin;

		expect(excluded).toHaveLength(skippedOrderIds.length);
		excluded.forEach((id) => expect(id).toBeInstanceOf(ObjectId));
		expect(excluded.map((id) => id.toString())).toEqual(skippedOrderIds);
	});
});
