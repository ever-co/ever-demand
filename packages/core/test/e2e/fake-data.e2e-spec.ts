import { createProduct, createWarehouse, addProductToWarehouse, gql, gqlData, SOFIA } from './helpers';

/**
 * The fake data generator of the admin app (Setup), enabled by
 * FAKE_DATA_GENERATOR=true. Runs last (see sequencer.js).
 */
describe('fake data generator (FAKE_DATA_GENERATOR=true)', () => {
	let storeId: string;

	beforeAll(async () => {
		storeId = (await createWarehouse()).id;
		const productId = (await createProduct()).id;
		await addProductToWarehouse(storeId, productId, 100, 700);
	});

	it('generates 1000 customers with an order each', async () => {
		const before = (await gqlData(`{ getCountOfUsers }`)).getCountOfUsers;

		const data = await gqlData(
			`query Generate($lng: Float!, $lat: Float!) {
				generate1000Customers(defaultLng: $lng, defaultLat: $lat) { success message }
			}`,
			{ lng: SOFIA[0], lat: SOFIA[1] }
		);

		expect(data.generate1000Customers).toEqual({ success: true, message: null });

		const after = (await gqlData(`{ getCountOfUsers }`)).getCountOfUsers;
		expect(after - before).toBe(1000);

		const metrics = await gqlData(`{ getUsersOrdersCountInfo { id ordersCount } }`);
		expect(metrics.getUsersOrdersCountInfo.length).toBeGreaterThanOrEqual(1000);
	});

	// 600 orders: the generator gives the orders a status by their number,
	// the last ones are delivered
	it('generates random orders for one store', async () => {
		const data = await gqlData(
			`query Generate($storeId: String!, $at: Date!) {
				generateRandomOrdersCurrentStore(storeId: $storeId, storeCreatedAt: $at, ordersLimit: 600) { error message }
			}`,
			{ storeId, at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() }
		);

		expect(data.generateRandomOrdersCurrentStore).toEqual({ error: false, message: null });

		const count = await gqlData(
			`query Count($storeId: String!) { getCountOfStoreOrders(storeId: $storeId, status: "all") }`,
			{ storeId }
		);
		expect(count.getCountOfStoreOrders).toBeGreaterThanOrEqual(600);
	});

	it('feeds the admin dashboard', async () => {
		const data = await gqlData(`{
			getDashboardCompletedOrders { warehouseId totalPrice }
			getOrdersChartTotalOrders { isCancelled isCompleted totalPrice _createdAt }
			getMerchantsOrdersCountInfo { id ordersCount }
		}`);

		expect(Array.isArray(data.getDashboardCompletedOrders)).toBe(true);
		expect(data.getOrdersChartTotalOrders.length).toBeGreaterThan(0);
		expect(data.getMerchantsOrdersCountInfo.map((m) => m.id)).toContain(storeId);
	});

	it('generates invite requests', async () => {
		const before = (await gqlData(`{ getCountOfInvitesRequests }`)).getCountOfInvitesRequests;

		const res = await gql(
			`query Generate($lng: Float!, $lat: Float!) { generate1000InviteRequests(defaultLng: $lng, defaultLat: $lat) }`,
			{ lng: SOFIA[0], lat: SOFIA[1] }
		);
		expect(res.errors).toBeUndefined();

		const after = (await gqlData(`{ getCountOfInvitesRequests }`)).getCountOfInvitesRequests;
		expect(after).toBeGreaterThan(before);
	});
});
