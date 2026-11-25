import {
	addProductToWarehouse,
	createCarrier,
	createProduct,
	createWarehouse,
	geoLocation,
	PyroClient,
	unique,
} from './helpers';

/**
 * The socket.io "pyro" RPC the apps use (common-angular router): a customer
 * registers, orders from a store and the order goes through its statuses,
 * the way the shop, merchant and carrier apps drive it.
 */
describe('socket.io pyro routers: registration and order flow', () => {
	const pyro = new PyroClient();

	let warehouseId: string;
	let productId: string;
	// socket.io sends the entities as JSON: `_id`, not the `id` getter
	let user: { _id: string; email: string };
	let orderId: string;
	let carrierId: string;

	beforeAll(async () => {
		carrierId = (await createCarrier()).id;
		warehouseId = (await createWarehouse()).id;
		productId = (await createProduct()).id;
		await addProductToWarehouse(warehouseId, productId, 5, 900);
	});

	afterAll(() => pyro.close());

	it('registers a customer (user-auth.register)', async () => {
		const email = `pyro_${unique()}@example.com`;

		user = await pyro.call('user-auth', 'register', {
			user: {
				email,
				firstName: 'Grace',
				lastName: 'Hopper',
				apartment: '7',
				geoLocation: geoLocation(),
			},
			password: 'pyro-password',
		});

		expect(user).toMatchObject({ email, firstName: 'Grace', apartment: '7' });
		expect(user._id).toMatch(/^[0-9a-f]{24}$/);
		// the password hash never leaves the server
		expect(JSON.stringify(user)).not.toMatch(/"hash"/);
	});

	it('logs the customer in (user-auth.login)', async () => {
		const res = await pyro.call('user-auth', 'login', user.email, 'pyro-password');

		expect(res.user._id).toBe(user._id);
		expect(res.token.split('.')).toHaveLength(3);
	});

	it('refuses a wrong password (user-auth.login resolves null)', async () => {
		await expect(pyro.call('user-auth', 'login', user.email, 'wrong')).resolves.toBeNull();
	});

	it('reads the customer (user.get observable)', async () => {
		const subscription = await pyro.observe('user', 'get', user._id);
		const current = await subscription.next();
		subscription.unsubscribe();

		expect(current._id).toBe(user._id);
	});

	it('creates an order (warehouse-orders.create)', async () => {
		const order = await pyro.call('warehouse-orders', 'create', {
			warehouseId,
			userId: user._id,
			products: [{ productId, count: 2 }],
		});

		orderId = order._id;

		expect(order).toMatchObject({
			warehouse: warehouseId,
			isConfirmed: false,
			isCancelled: false,
			warehouseStatus: 0,
			carrierStatus: 0,
		});
		expect(order.orderNumber).toBe(1);
		expect(order.products).toHaveLength(1);
		expect(order.products[0]).toMatchObject({ count: 2, price: 900 });
	});

	it('takes the ordered count from the store stock', async () => {
		const subscription = await pyro.observe('warehouse', 'get', warehouseId, true);
		const store = await subscription.next();
		subscription.unsubscribe();

		const stock = store.products.find((p) => (p.product._id ?? p.product) === productId);
		expect(stock).toMatchObject({ count: 3, soldCount: 2 });
	});

	it('refuses an order for more than the stock', async () => {
		await expect(
			pyro.call('warehouse-orders', 'create', {
				warehouseId,
				userId: user._id,
				products: [{ productId, count: 50 }],
			})
		).rejects.toThrow();
	});

	it('pushes status changes to an order.get subscriber', async () => {
		const subscription = await pyro.observe('order', 'get', orderId);
		await subscription.next((o) => o != null && o._id === orderId);

		const confirmed = await pyro.call('order', 'confirm', orderId);
		expect(confirmed.isConfirmed).toBe(true);

		// ReadyForProcessing (1) -> PackagingFinished (6), skipping steps is allowed
		await pyro.call('order', 'updateWarehouseStatus', orderId, 1);
		const packaged = await pyro.call('order', 'updateWarehouseStatus', orderId, 6);
		expect(packaged.warehouseStatus).toBe(6);

		const pushed = await subscription.next((o) => o.warehouseStatus === 6);
		expect(pushed).toMatchObject({ _id: orderId, isConfirmed: true, warehouseStatus: 6 });

		// the carrier app selects the order (CarrierSelectedOrder, 1), then picks it up (2)
		const carrier = await pyro.call('carrier-orders', 'selectedForDelivery', carrierId, [orderId]);
		expect(carrier._id).toBe(carrierId);
		await subscription.next((o) => o.carrierStatus === 1);

		const pickedUp = await pyro.call('order', 'updateCarrierStatus', orderId, 2);
		expect(pickedUp.carrierStatus).toBe(2);
		await subscription.next((o) => o.carrierStatus === 2);

		subscription.unsubscribe();
	});

	it('refuses a status that goes back', async () => {
		await expect(pyro.call('order', 'updateWarehouseStatus', orderId, 1)).rejects.toThrow();
	});

	it('lists the order of the customer (user-orders.get)', async () => {
		const subscription = await pyro.observe('user-orders', 'get', user._id);
		const orders = await subscription.next((list) => Array.isArray(list) && list.length > 0);
		subscription.unsubscribe();

		expect(orders.map((o) => o._id)).toContain(orderId);
	});

	it('cancels an order and gives its stock back (warehouse-orders.cancel)', async () => {
		const order = await pyro.call('warehouse-orders', 'create', {
			warehouseId,
			userId: user._id,
			products: [{ productId, count: 1 }],
		});

		const cancelled = await pyro.call('warehouse-orders', 'cancel', order._id);
		expect(cancelled.isCancelled).toBe(true);

		const subscription = await pyro.observe('warehouse', 'get', warehouseId, true);
		const store = await subscription.next();
		subscription.unsubscribe();

		const stock = store.products.find((p) => (p.product._id ?? p.product) === productId);
		expect(stock.count).toBe(3);

		// a cancelled order takes no more status changes
		await expect(pyro.call('order', 'updateWarehouseStatus', order._id, 6)).rejects.toThrow();
	});

	it('answers an error, not a crash, for an unknown order', async () => {
		await expect(
			pyro.call('order', 'confirm', '000000000000000000000000')
		).rejects.toThrow();
	});
});
