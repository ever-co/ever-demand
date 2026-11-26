import { expect, test } from '@playwright/test';
import { createStoreWithProduct, geoLocation, PyroClient, unique, adminToken } from './api-helpers';

test.describe.configure({ mode: 'serial' });

/** The socket.io "pyro" RPC of the apps: register, order, order statuses. */
test.describe('socket.io pyro routers', () => {
	const pyro = new PyroClient();
	let storeId: string;
	let productId: string;
	// entities arrive as JSON over socket.io: `_id`, not the `id` getter
	let user: { _id: string; email: string };
	let orderId: string;

	test.beforeAll(async () => {
		({ storeId, productId } = await createStoreWithProduct(5, 900));
	});

	test.afterAll(() => pyro.close());

	test('user-auth.register and login', async () => {
		const email = `e2e_pyro_${unique()}@example.com`;

		user = await pyro.call('user-auth', 'register', {
			user: { email, firstName: 'Pyro', apartment: '2', geoLocation: geoLocation() },
			password: 'e2e-password',
		});
		expect(user.email).toBe(email);

		const login = await pyro.call('user-auth', 'login', email, 'e2e-password');
		expect(login.user._id).toBe(user._id);
	});

	test('warehouse-orders.create takes the stock', async () => {
		const order = await pyro.call('warehouse-orders', 'create', {
			warehouseId: storeId,
			userId: user._id,
			products: [{ productId, count: 2 }],
		});
		orderId = order._id;

		expect(order.products[0]).toMatchObject({ count: 2, price: 900 });

		const subscription = await pyro.observe('warehouse', 'get', storeId, true);
		const store = await subscription.next();
		subscription.unsubscribe();

		const stock = store.products.find((p) => (p.product._id ?? p.product) === productId);
		expect(stock).toMatchObject({ count: 3, soldCount: 2 });
	});

	test('order.get pushes the warehouse status changes', async () => {
		const subscription = await pyro.observe('order', 'get', orderId);
		await subscription.next((o) => o?._id === orderId);

		await pyro.call('order', 'confirm', orderId);
		// a merchant action: the store (here the admin) logs in through the handshake
		const staff = new PyroClient({ token: await adminToken() });
		try {
			await staff.call('order', 'updateWarehouseStatus', orderId, 6);
		} finally {
			staff.close();
		}

		const pushed = await subscription.next((o) => o.warehouseStatus === 6);
		subscription.unsubscribe();

		expect(pushed).toMatchObject({ _id: orderId, isConfirmed: true, warehouseStatus: 6 });
	});

	test('a cancelled order gives its stock back', async () => {
		const order = await pyro.call('warehouse-orders', 'create', {
			warehouseId: storeId,
			userId: user._id,
			products: [{ productId, count: 1 }],
		});

		expect((await pyro.call('warehouse-orders', 'cancel', order._id)).isCancelled).toBe(true);

		const subscription = await pyro.observe('warehouse', 'get', storeId, true);
		const store = await subscription.next();
		subscription.unsubscribe();

		expect(store.products.find((p) => (p.product._id ?? p.product) === productId).count).toBe(3);
	});
});
