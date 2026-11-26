import { expect, test } from '@playwright/test';
import { ADMIN, createStoreWithProduct, geoLocation, gql, gqlData, SOFIA, unique } from './api-helpers';

test.describe.configure({ mode: 'serial' });

test.describe('GraphQL API (queries the apps use)', () => {
	let token: string;
	let storeId: string;
	let productId: string;
	let userId: string;

	test('the default admin logs in', async () => {
		const data = await gqlData(
			`mutation L($email: String!, $password: String!) { adminLogin(email: $email, password: $password) { token admin { email } } }`,
			ADMIN
		);

		token = data.adminLogin.token;
		expect(data.adminLogin.admin.email).toBe(ADMIN.email);
		expect(token.split('.')).toHaveLength(3);
	});

	test('adminAuthenticated reads the Bearer token', async () => {
		expect((await gqlData(`{ adminAuthenticated }`, {}, token)).adminAuthenticated).toBe(true);
		expect((await gqlData(`{ adminAuthenticated }`, {}, null)).adminAuthenticated).toBe(false);
	});

	test('app settings and currencies', async () => {
		const data = await gqlData(`{ adminAppSettings { adminPasswordReset fakeDataGenerator } currencies { currencyCode } }`);

		expect(Object.keys(data.adminAppSettings)).toEqual(['adminPasswordReset', 'fakeDataGenerator']);
		expect(Array.isArray(data.currencies)).toBe(true);
	});

	test('a store with a product in stock is listed', async () => {
		({ storeId, productId } = await createStoreWithProduct(10, 1500));

		const data = await gqlData(
			`query Q($id: String!) {
				warehouse(id: $id) { id isActive }
				warehouses { id }
				products { id }
				getStoreProducts(storeId: $id, fullProducts: true) { count price product { id } }
			}`,
			{ id: storeId }
		);

		expect(data.warehouse).toEqual({ id: storeId, isActive: true });
		expect(data.warehouses.map((w) => w.id)).toContain(storeId);
		expect(data.products.map((p) => p.id)).toContain(productId);
		expect(data.getStoreProducts).toEqual([{ count: 10, price: 1500, product: { id: productId } }]);
	});

	test('a customer registers and logs in', async () => {
		const email = `e2e_${unique()}@example.com`;

		userId = (
			await gqlData(`mutation R($i: UserRegisterInput!) { registerUser(registerInput: $i) { id } }`, {
				i: { user: { email, firstName: 'E2E', apartment: '1', geoLocation: geoLocation() }, password: 'e2e-password' },
			})
		).registerUser.id;

		const login = await gqlData(
			`mutation L($email: String!) { userLogin(email: $email, password: "e2e-password") { user { id } token } }`,
			{ email }
		);
		expect(login.userLogin.user.id).toBe(userId);

		const users = await gqlData(`{ users { id } getCountOfUsers }`);
		expect(users.users.map((u) => u.id)).toContain(userId);
	});

	test('an order takes the stock of the store', async () => {
		const order = (
			await gqlData(
				`mutation C($c: OrderCreateInput!) { createOrder(createInput: $c) { id totalPrice products { count } } }`,
				{ c: { userId, warehouseId: storeId, products: [{ productId, count: 3 }] } }
			)
		).createOrder;

		expect(order.totalPrice).toBe(4500);

		const data = await gqlData(
			`query Q($id: String!, $userId: String!, $storeId: String!) {
				getOrder(id: $id) { id warehouseStatus carrierStatus }
				getOrders(userId: $userId) { id }
				getStoreProducts(storeId: $storeId, fullProducts: false) { count soldCount }
			}`,
			{ id: order.id, userId, storeId }
		);

		expect(data.getOrder).toEqual({ id: order.id, warehouseStatus: 0, carrierStatus: 0 });
		expect(data.getOrders.map((o) => o.id)).toContain(order.id);
		expect(data.getStoreProducts).toEqual([{ count: 7, soldCount: 3 }]);
	});

	test('the store is found near the customer', async () => {
		const data = await gqlData(
			`query N($g: GeoLocationFindInput!) { nearbyStores(geoLocation: $g) { id } geoLocationProducts(geoLocation: $g) { warehouseId } }`,
			{ g: geoLocation([SOFIA[0] + 0.001, SOFIA[1]]) }
		);

		expect(data.nearbyStores.map((w) => w.id)).toContain(storeId);
		expect(data.geoLocationProducts.map((p) => p.warehouseId)).toContain(storeId);
	});

	test('an invalid query is a validation error', async () => {
		const res = await gql(`{ noSuchField }`);

		expect(res.errors?.[0].message).toMatch(/noSuchField/);
	});
});
