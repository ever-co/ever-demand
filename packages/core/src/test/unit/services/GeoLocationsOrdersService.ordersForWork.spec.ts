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

	describe('with a bad id already stored on the carrier', () => {
		const validId = '5c4f1b3e2d4a1b001234567a';
		// 'x' makes `new ObjectId()` throw; 'twelve-chars' is the 12-character
		// form `ObjectId.isValid()` accepts as 12 raw bytes.
		const storedIds = ['x', 'twelve-chars', validId];

		it('getOrdersForWork still runs and excludes the valid id', async () => {
			await expect(
				service.getOrdersForWork(geoLocation, storedIds, {
					sort: 'asc',
				})
			).resolves.toEqual([]);

			const excluded = topLevelMatch(pipelines[0])._id.$nin;

			excluded.forEach((id) => expect(id).toBeInstanceOf(ObjectId));
			expect(excluded.map((id) => id.toString())).toEqual([validId]);
		});

		it('getCountOfOrdersForWork still runs and excludes the valid id', async () => {
			await expect(
				service.getCountOfOrdersForWork(geoLocation, storedIds)
			).resolves.toBe(0);

			const excluded = topLevelMatch(pipelines[0])._id.$nin;

			excluded.forEach((id) => expect(id).toBeInstanceOf(ObjectId));
			expect(excluded.map((id) => id.toString())).toEqual([validId]);
		});
	});

	// Both work queries take the same `byRegex` search, from a socket listener
	// and a GraphQL query alike, so every case runs against both of them.
	describe.each([
		[
			'getOrdersForWork',
			(searchObj: any) =>
				service.getOrdersForWork(
					geoLocation,
					skippedOrderIds,
					{ sort: 'asc' },
					searchObj
				),
		],
		[
			'getCountOfOrdersForWork',
			(searchObj: any) =>
				service.getCountOfOrdersForWork(
					geoLocation,
					skippedOrderIds,
					searchObj
				),
		],
	])('%s search', (_name, search: (searchObj: any) => Promise<unknown>) => {
		const byRegex = (key: string, value: string) => ({
			byRegex: [{ key, value }],
		});

		it("keeps the nearby-store filter when the search key is 'warehouse'", async () => {
			await search(byRegex('warehouse', '.'));

			expect(topLevelMatch(pipelines[0]).warehouse).toEqual({
				$in: ['warehouse-1'],
			});
		});

		it('cannot replace any base filter through the search key', async () => {
			await search(undefined);
			const baseline = topLevelMatch(pipelines[0]);

			await search({
				byRegex: [
					'warehouse',
					'warehouseStatus',
					'orderType',
					'$expr',
					'_id',
				].map((key) => ({ key, value: '.' })),
			});
			const searched = topLevelMatch(pipelines[1]);

			expect(searched).toEqual(baseline);
		});

		it("escapes the value, so '(a+)+$' is matched as plain text", async () => {
			await search(byRegex('user.firstName', '(a+)+$'));

			const match = topLevelMatch(pipelines[0]);

			expect(match.$and).toEqual([
				{
					'user.firstName': {
						$regex: '\\(a\\+\\)\\+\\$',
						$options: 'i',
					},
				},
			]);

			const pattern = new RegExp(
				match.$and[0]['user.firstName'].$regex,
				'i'
			);
			expect(pattern.test('Name (a+)+$')).toBe(true);
			expect(pattern.test('aaaa')).toBe(false);
		});

		it("still matches a 'user.firstName' search case-insensitively", async () => {
			await search(byRegex('user.firstName', 'Jo'));

			const match = topLevelMatch(pipelines[0]);

			expect(match.$and).toEqual([
				{ 'user.firstName': { $regex: 'Jo', $options: 'i' } },
			]);
			expect(match.warehouse).toEqual({ $in: ['warehouse-1'] });

			const pattern = new RegExp(
				match.$and[0]['user.firstName'].$regex,
				match.$and[0]['user.firstName'].$options
			);
			expect(pattern.test('john')).toBe(true);
			expect(pattern.test('Maria')).toBe(false);
		});
	});

	describe('getOrdersForWork isCancelled search', () => {
		const searchFor = (isCancelled: any) =>
			service.getOrdersForWork(
				geoLocation,
				skippedOrderIds,
				{ sort: 'asc' },
				{ isCancelled }
			);

		it('drops an isCancelled that is not a boolean', async () => {
			await searchFor({ $ne: null });

			const match = topLevelMatch(pipelines[0]);

			expect(match.isCancelled).toBeUndefined();
			expect(match.$and).toBeUndefined();
		});

		it('adds a boolean isCancelled next to the base filters', async () => {
			await searchFor(false);

			const match = topLevelMatch(pipelines[0]);

			expect(match.$and).toEqual([{ isCancelled: false }]);
			expect(match.orderType).toBe(DeliveryType.Delivery);
		});
	});
});
