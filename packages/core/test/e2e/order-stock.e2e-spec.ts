import { MongoClient, ObjectId } from 'mongodb';
import {
	addProductToWarehouse,
	createProduct,
	createWarehouse,
	defaultAdminToken,
	geoLocation,
	PyroClient,
	unique,
} from './helpers';
import { DB_NAME, MONGO_URL } from './server';

/**
 * Customers who order the last items of a store at the same moment, through
 * the socket.io routers the shops use. Every order passes the stock check,
 * but the store's guarded stock write lets only one of them take the items.
 * The orders that are refused must not stay saved, and the lines they had
 * already taken must go back into stock.
 *
 * The database is the judge: for every product, the stock that left the
 * store and its sold count both equal what the saved orders hold.
 */
describe('orders racing for the last items keep orders and stock consistent', () => {
	const CUSTOMERS = 6;
	// one socket per customer, as each shop app has its own
	const shops: PyroClient[] = [];
	const customerIds: string[] = [];
	let mongo: MongoClient;

	/** A new store with a product in plenty and one with only 2 items left. */
	async function storeWithLastItems() {
		const warehouseId = (await createWarehouse()).id;
		const plenty = (await createProduct()).id;
		const last = (await createProduct()).id;

		await addProductToWarehouse(warehouseId, plenty, 100, 500);
		await addProductToWarehouse(warehouseId, last, 2, 900);

		return { warehouseId, plenty, last, initial: { [plenty]: 100, [last]: 2 } };
	}

	/** The saved orders of the store, read from the database. */
	function savedOrders(warehouseId: string) {
		return mongo
			.db(DB_NAME)
			.collection('orders')
			.find({
				// the order keeps the store id as a string
				warehouse: { $in: [warehouseId, new ObjectId(warehouseId)] },
				isDeleted: { $ne: true },
				isCancelled: { $ne: true },
			})
			.toArray();
	}

	/** Stock and sold count of every product of the store, from the database. */
	async function storeCounts(warehouseId: string) {
		const store = await mongo
			.db(DB_NAME)
			.collection('warehouses')
			.findOne({ _id: new ObjectId(warehouseId) });

		const counts: Record<string, { count: number; soldCount: number }> = {};
		for (const p of store!.products) {
			counts[String(p.product)] = { count: p.count, soldCount: p.soldCount };
		}

		return counts;
	}

	/**
	 * For every product: the stock taken from the store and its sold count
	 * equal the count the saved orders hold.
	 */
	async function expectOrdersMatchStock(
		warehouseId: string,
		initial: Record<string, number>
	) {
		const orders = await savedOrders(warehouseId);
		const counts = await storeCounts(warehouseId);

		const held: Record<string, number> = {};
		for (const productId of Object.keys(initial)) {
			held[productId] = 0;
		}
		for (const order of orders) {
			for (const line of order.products) {
				held[String(line.product._id)] += line.count;
			}
		}

		for (const productId of Object.keys(initial)) {
			const { count, soldCount } = counts[productId];

			expect({
				productId,
				takenFromStock: initial[productId] - count,
				soldCount,
			}).toEqual({
				productId,
				takenFromStock: held[productId],
				soldCount: held[productId],
			});
		}

		return orders;
	}

	const refusedOnly = (results: PromiseSettledResult<unknown>[]) => {
		const refused = results.filter(
			(r): r is PromiseRejectedResult => r.status === 'rejected'
		);
		for (const r of refused) {
			expect(r.reason.message).toMatch(/more products than available/);
		}
		return refused;
	};

	beforeAll(async () => {
		mongo = await MongoClient.connect(MONGO_URL);

		for (let i = 0; i < CUSTOMERS; i++) {
			const shop = new PyroClient();
			shops.push(shop);

			const customer = await shop.call<{ _id: string }>(
				'user-auth',
				'register',
				{
					user: {
						email: `race_${unique()}@example.com`,
						firstName: 'Race',
						lastName: `Customer ${i}`,
						apartment: String(i + 1),
						geoLocation: geoLocation(),
					},
					password: 'race-password',
				}
			);
			customerIds.push(customer._id);
		}
	});

	afterAll(async () => {
		shops.forEach((shop) => shop.close());
		await mongo?.close();
	});

	it('saves only the order that got the last items (warehouse-orders.create)', async () => {
		const { warehouseId, plenty, last, initial } = await storeWithLastItems();

		// every customer orders 1 x plenty and the last 2 items, all at once
		const results = await Promise.allSettled(
			shops.map((shop, i) =>
				shop.call('warehouse-orders', 'create', {
					warehouseId,
					userId: customerIds[i],
					products: [
						{ productId: plenty, count: 1 },
						{ productId: last, count: 2 },
					],
				})
			)
		);

		expect(refusedOnly(results)).toHaveLength(CUSTOMERS - 1);

		const orders = await expectOrdersMatchStock(warehouseId, initial);
		// no order is left behind without its stock
		expect(orders).toHaveLength(1);
		expect(await storeCounts(warehouseId)).toMatchObject({
			[plenty]: { count: 99, soldCount: 1 },
			[last]: { count: 0, soldCount: 2 },
		});
	});

	it('adds the last items only to the order that got them (warehouse-orders.addMore)', async () => {
		const { warehouseId, plenty, last, initial } = await storeWithLastItems();

		// every customer already has an order of 1 x plenty
		const created: { _id: string }[] = [];
		for (let i = 0; i < CUSTOMERS; i++) {
			created.push(
				await shops[i].call('warehouse-orders', 'create', {
					warehouseId,
					userId: customerIds[i],
					products: [{ productId: plenty, count: 1 }],
				})
			);
		}

		// then all of them add 1 x plenty and the last 2 items at once
		const results = await Promise.allSettled(
			shops.map((shop, i) =>
				shop.call(
					'warehouse-orders',
					'addMore',
					warehouseId,
					customerIds[i],
					created[i]._id,
					[
						{ productId: plenty, count: 1 },
						{ productId: last, count: 2 },
					]
				)
			)
		);

		expect(refusedOnly(results)).toHaveLength(CUSTOMERS - 1);

		const orders = await expectOrdersMatchStock(warehouseId, initial);
		expect(orders).toHaveLength(CUSTOMERS);
		// one order holds 3 lines, the others still hold only their first one
		expect(orders.map((o) => o.products.length).sort()).toEqual([
			1, 1, 1, 1, 1, 3,
		]);
		expect(await storeCounts(warehouseId)).toMatchObject({
			[plenty]: { count: 100 - CUSTOMERS - 1, soldCount: CUSTOMERS + 1 },
			[last]: { count: 0, soldCount: 2 },
		});
	});

	/** A new store with two products in plenty. */
	async function storeWithPlenty() {
		const warehouseId = (await createWarehouse()).id;
		const first = (await createProduct()).id;
		const second = (await createProduct()).id;

		await addProductToWarehouse(warehouseId, first, 100, 500);
		await addProductToWarehouse(warehouseId, second, 50, 900);

		return {
			warehouseId,
			first,
			second,
			initial: { [first]: 100, [second]: 50 },
		};
	}

	it('keeps the lines of two addMore calls on one order at once', async () => {
		const { warehouseId, first, second, initial } = await storeWithPlenty();

		// every customer has an order of 1 x first
		const created: { _id: string }[] = [];
		for (let i = 0; i < CUSTOMERS; i++) {
			created.push(
				await shops[i].call('warehouse-orders', 'create', {
					warehouseId,
					userId: customerIds[i],
					products: [{ productId: first, count: 1 }],
				})
			);
		}

		// each customer adds two lines from two devices at the same moment
		// (the shop socket and the next one), for all orders at once
		const addMore = (
			device: PyroClient,
			i: number,
			productId: string,
			count: number
		) =>
			device.call(
				'warehouse-orders',
				'addMore',
				warehouseId,
				customerIds[i],
				created[i]._id,
				[{ productId, count }]
			);

		const results = await Promise.allSettled(
			created.flatMap((_order, i) => [
				addMore(shops[i], i, first, 2),
				addMore(shops[(i + 1) % CUSTOMERS], i, second, 1),
			])
		);

		expect(results.filter((r) => r.status === 'rejected')).toEqual([]);

		const orders = await expectOrdersMatchStock(warehouseId, initial);
		expect(orders).toHaveLength(CUSTOMERS);
		// no add lost its line to the other one
		for (const order of orders) {
			expect(
				order.products
					.map(
						(line: any) =>
							`${String(line.product._id)} x ${line.count}`
					)
					.sort()
			).toEqual([`${first} x 1`, `${first} x 2`, `${second} x 1`].sort());
		}
		expect(await storeCounts(warehouseId)).toMatchObject({
			[first]: { count: 100 - 3 * CUSTOMERS, soldCount: 3 * CUSTOMERS },
			[second]: { count: 50 - CUSTOMERS, soldCount: CUSTOMERS },
		});
	});

	it('refuses addMore on a cancelled order and takes no stock for it', async () => {
		const { warehouseId, first, second, initial } = await storeWithPlenty();

		const order = await shops[0].call<{ _id: string }>(
			'warehouse-orders',
			'create',
			{
				warehouseId,
				userId: customerIds[0],
				products: [{ productId: first, count: 1 }],
			}
		);
		await shops[0].call('warehouse-orders', 'cancel', order._id);

		await expect(
			shops[0].call(
				'warehouse-orders',
				'addMore',
				warehouseId,
				customerIds[0],
				order._id,
				[
					{ productId: first, count: 2 },
					{ productId: second, count: 1 },
				]
			)
		).rejects.toThrow(/is cancelled/);

		// the cancel put the first line back, and nothing else left the store
		await expectOrdersMatchStock(warehouseId, initial);
		expect(await storeCounts(warehouseId)).toMatchObject({
			[first]: { count: 100, soldCount: 0 },
			[second]: { count: 50, soldCount: 0 },
		});

		const saved = await mongo
			.db(DB_NAME)
			.collection('orders')
			.findOne({ _id: new ObjectId(order._id) });
		expect(saved!.isCancelled).toBe(true);
		expect(saved!.products).toHaveLength(1);
	});

	it('order.addProducts: a later line with too little stock puts the earlier lines back and raises no sold count', async () => {
		const { warehouseId, plenty, last, initial } = await storeWithLastItems();
		// the admin order page, with the admin's login in the socket handshake
		const staff = new PyroClient({ token: await defaultAdminToken() });

		try {
			const order = await shops[0].call<{ _id: string }>(
				'warehouse-orders',
				'create',
				{
					warehouseId,
					userId: customerIds[0],
					products: [{ productId: plenty, count: 1 }],
				}
			);

			// 1 more x plenty gets its stock, then 3 x last (2 left) is refused
			await expect(
				staff.call(
					'order',
					'addProducts',
					order._id,
					[
						{ productId: plenty, count: 1 },
						{ productId: last, count: 3 },
					],
					warehouseId
				)
			).rejects.toThrow(/more products than available/);

			// the order is unchanged, and so are the stock and the sold counts
			await expectOrdersMatchStock(warehouseId, initial);
			expect(await storeCounts(warehouseId)).toMatchObject({
				[plenty]: { count: 99, soldCount: 1 },
				[last]: { count: 2, soldCount: 0 },
			});

			const saved = await mongo
				.db(DB_NAME)
				.collection('orders')
				.findOne({ _id: new ObjectId(order._id) });
			expect(
				saved!.products.map(
					(line: any) => `${String(line.product._id)} x ${line.count}`
				)
			).toEqual([`${plenty} x 1`]);
		} finally {
			staff.close();
		}
	});
});
