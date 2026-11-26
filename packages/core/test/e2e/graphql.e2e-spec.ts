import {
	ANONYMOUS,
	addProductToWarehouse,
	adminToken,
	createProduct,
	createWarehouse,
	geoLocation,
	gql,
	gqlData,
	PyroClient,
	SOFIA,
	unique,
} from './helpers';

/**
 * The GraphQL API (schema-first, Apollo Server 5) with the queries and
 * mutations the admin, merchant, carrier and shop apps use most.
 */
describe('GraphQL API', () => {
	describe('admin auth (default admin created on first boot)', () => {
		it('logs the default admin in and returns a JWT', async () => {
			const data = await gqlData(
				`mutation { adminLogin(email: "admin@ever.co", password: "admin") {
					token admin { id email name pictureUrl }
				} }`
			);

			expect(data.adminLogin.admin).toMatchObject({ email: 'admin@ever.co', name: 'Admin' });
			expect(data.adminLogin.token.split('.')).toHaveLength(3);
		});

		it('refuses a wrong password', async () => {
			const data = await gqlData(
				`mutation { adminLogin(email: "admin@ever.co", password: "wrong") { token } }`
			);

			expect(data.adminLogin).toBeNull();
		});

		it('adminAuthenticated reads the Authorization: Bearer header', async () => {
			const token = await adminToken();
			const query = `{ adminAuthenticated }`;

			expect((await gqlData(query, {}, token)).adminAuthenticated).toBe(true);
			expect((await gqlData(query, {}, ANONYMOUS)).adminAuthenticated).toBe(false);
			expect((await gqlData(query, {}, 'not-a-jwt')).adminAuthenticated).toBe(false);
		});

		it('finds the admin by email and hides the password hash', async () => {
			const data = await gqlData(`{ adminByEmail(email: "admin@ever.co") { id email name } }`);

			expect(data.adminByEmail.email).toBe('admin@ever.co');
			expect(JSON.stringify(data)).not.toMatch(/hash/);
		});

		it('reports the app settings set by the environment', async () => {
			const data = await gqlData(`{ adminAppSettings { adminPasswordReset fakeDataGenerator } }`);

			expect(data.adminAppSettings).toEqual({ adminPasswordReset: 1, fakeDataGenerator: 1 });
		});
	});

	describe('errors', () => {
		it('answers 400 with a validation error for an unknown field', async () => {
			const res = await gql(`{ noSuchField }`);

			expect(res.status).toBe(400);
			expect(res.errors[0].message).toMatch(/noSuchField/);
			expect(res.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
		});

		it('returns resolver errors with the data', async () => {
			const res = await gql(`mutation { updateAdmin(id: "000000000000000000000000", updateInput: { name: "x" }) { id } }`);

			expect(res.errors?.length).toBeGreaterThan(0);
		});

		it('keeps the fake-data queries open while FAKE_DATA_GENERATOR is on', async () => {
			// the guard lets clearAll through; it is not run here (it would
			// wipe the data of the other suites), only its guard is checked
			const res = await gql(`{ __type(name: "Query") { fields { name } } }`);
			const names = res.data.__type.fields.map((f) => f.name);

			expect(names).toEqual(expect.arrayContaining(['clearAll', 'generate1000Customers']));
		});
	});

	describe('currencies', () => {
		it('creates a currency and lists it', async () => {
			const code = `T${unique().slice(0, 2).toUpperCase()}`;
			const created = await gqlData(
				`mutation Create($code: String!) {
					createCurrency(createInput: { currencyCode: $code }) { success message data { currencyCode } }
				}`,
				{ code }
			);

			expect(created.createCurrency).toMatchObject({ success: true, data: { currencyCode: code } });

			const data = await gqlData(`{ currencies { currencyCode } }`);
			expect(data.currencies.map((c) => c.currencyCode)).toContain(code);
		});
	});

	describe('merchants, products, customers, carriers and orders', () => {
		let warehouse: { id: string; name: string; username: string };
		let product: { id: string };
		let userId: string;
		let carrierId: string;
		let orderId: string;

		beforeAll(async () => {
			warehouse = await createWarehouse();
			product = await createProduct();
			await addProductToWarehouse(warehouse.id, product.id, 10, 1500);
		});

		it('logs the warehouse in', async () => {
			const data = await gqlData(
				`mutation Login($username: String!) {
					warehouseLogin(username: $username, password: "store-password") { token warehouse { id name } }
				}`,
				{ username: warehouse.username }
			);

			expect(data.warehouseLogin.warehouse).toEqual({ id: warehouse.id, name: warehouse.name });
			expect(typeof data.warehouseLogin.token).toBe('string');
		});

		it('lists and reads warehouses', async () => {
			const data = await gqlData(
				`query Read($id: String!) {
					warehouse(id: $id) { id name isActive geoLocation { city loc { type coordinates } } }
					warehouses { id }
					getAllStores { id }
					hasExistingStores
					getCountOfMerchants
				}`,
				{ id: warehouse.id }
			);

			expect(data.warehouse).toMatchObject({
				id: warehouse.id,
				isActive: true,
				geoLocation: { city: 'Sofia', loc: { type: 'Point', coordinates: SOFIA } },
			});
			expect(data.warehouses.map((w) => w.id)).toContain(warehouse.id);
			expect(data.getAllStores.map((w) => w.id)).toContain(warehouse.id);
			expect(data.hasExistingStores).toBe(true);
			expect(data.getCountOfMerchants).toBeGreaterThanOrEqual(1);
		});

		it('lists and reads products, and the products of the store', async () => {
			const data = await gqlData(
				`query Read($id: String!, $storeId: String!) {
					product(id: $id) { id title { locale value } images { url } }
					products { id }
					getCountOfProducts
					getStoreProducts(storeId: $storeId, fullProducts: true) { count price product { id } }
				}`,
				{ id: product.id, storeId: warehouse.id }
			);

			expect(data.product.id).toBe(product.id);
			expect(data.product.title[0].locale).toBe('en-US');
			expect(data.products.map((p) => p.id)).toContain(product.id);
			expect(data.getCountOfProducts).toBeGreaterThanOrEqual(1);
			expect(data.getStoreProducts).toEqual([
				{ count: 10, price: 1500, product: { id: product.id } },
			]);
		});

		it('creates and lists product categories', async () => {
			const name = `Category ${unique()}`;
			const created = await gqlData(
				`mutation Create($name: String!) {
					createProductsCategory(createInput: { name: [{ locale: "en-US", value: $name }] }) { id name { value } }
				}`,
				{ name }
			);

			const data = await gqlData(`{ productsCategories { id } }`);
			expect(data.productsCategories.map((c) => c.id)).toContain(created.createProductsCategory.id);
		});

		it('registers a customer, logs them in and finds them', async () => {
			const email = `customer_${unique()}@example.com`;
			const registered = await gqlData(
				`mutation Register($registerInput: UserRegisterInput!) {
					registerUser(registerInput: $registerInput) { id email firstName apartment }
				}`,
				{
					registerInput: {
						user: {
							email,
							firstName: 'Ada',
							lastName: 'Lovelace',
							apartment: '3',
							geoLocation: geoLocation(),
						},
						password: 'customer-password',
					},
				}
			);

			userId = registered.registerUser.id;
			expect(registered.registerUser).toMatchObject({ email, firstName: 'Ada', apartment: '3' });

			const login = await gqlData(
				`mutation Login($email: String!) {
					userLogin(email: $email, password: "customer-password") { token user { id } }
				}`,
				{ email }
			);
			expect(login.userLogin.user.id).toBe(userId);

			const data = await gqlData(
				`query Read($id: String!, $email: String!) {
					user(id: $id) { id email }
					users { id }
					isUserEmailExists(email: $email)
					getCountOfUsers
				}`,
				{ id: userId, email }
			);

			expect(data.user).toEqual({ id: userId, email });
			expect(data.users.map((u) => u.id)).toContain(userId);
			expect(data.isUserEmailExists).toBe(true);
			expect(data.getCountOfUsers).toBeGreaterThanOrEqual(1);
		});

		it('registers a carrier, logs them in and lists them', async () => {
			const username = `carrier_${unique()}`;
			const registered = await gqlData(
				`mutation Register($registerInput: CarrierRegisterInput!) {
					registerCarrier(registerInput: $registerInput) { id username firstName }
				}`,
				{
					registerInput: {
						password: 'carrier-password',
						carrier: {
							firstName: 'Carl',
							lastName: 'Carrier',
							username,
							password: 'carrier-password',
							phone: '+359000000',
							logo: 'https://example.com/carrier.png',
							geoLocation: geoLocation(),
						},
					},
				}
			);

			carrierId = registered.registerCarrier.id;

			const login = await gqlData(
				`mutation Login($username: String!) {
					carrierLogin(username: $username, password: "carrier-password") { token carrier { id } }
				}`,
				{ username }
			);
			expect(login.carrierLogin.carrier.id).toBe(carrierId);

			const data = await gqlData(
				`query Read($id: String!) {
					getCarrier(id: $id) { id username }
					getCarriers { id }
					getCountOfCarriers
				}`,
				{ id: carrierId }
			);

			expect(data.getCarrier).toEqual({ id: carrierId, username });
			expect(data.getCarriers.map((c) => c.id)).toContain(carrierId);
			expect(data.getCountOfCarriers).toBeGreaterThanOrEqual(1);
		});

		it('creates an order for the customer and takes the stock', async () => {
			const created = await gqlData(
				`mutation Create($createInput: OrderCreateInput!) {
					createOrder(createInput: $createInput) {
						id orderNumber warehouseId isConfirmed isCancelled totalPrice
						warehouseStatus carrierStatus
						user { id }
						products { count price product { id } }
					}
				}`,
				{
					createInput: {
						userId,
						warehouseId: warehouse.id,
						products: [{ productId: product.id, count: 2 }],
						options: { autoConfirm: true },
					},
				}
			);

			const order = created.createOrder;
			orderId = order.id;

			expect(order).toMatchObject({
				orderNumber: 1,
				warehouseId: warehouse.id,
				isConfirmed: true,
				isCancelled: false,
				totalPrice: 3000,
				warehouseStatus: 0,
				carrierStatus: 0,
				user: { id: userId },
				products: [{ count: 2, price: 1500, product: { id: product.id } }],
			});

			const stock = await gqlData(
				`query Stock($storeId: String!) { getStoreProducts(storeId: $storeId, fullProducts: false) { count soldCount } }`,
				{ storeId: warehouse.id }
			);
			expect(stock.getStoreProducts).toEqual([{ count: 8, soldCount: 2 }]);
		});

		it('reads orders by id, by customer and by store', async () => {
			const data = await gqlData(
				`query Read($id: String!, $userId: String!, $storeId: String!) {
					getOrder(id: $id) { id warehouseStatusText carrierStatusText }
					orders(findInput: { warehouse: $storeId, warehouseStatus: 0, carrierStatus: 0 }) { id }
					getOrders(userId: $userId) { id }
					getStoreOrders(storeId: $storeId) { id }
					getNextOrderNumber(storeId: $storeId)
					getCountOfStoreOrders(storeId: $storeId, status: "all")
				}`,
				{ id: orderId, userId, storeId: warehouse.id }
			);

			expect(data.getOrder.id).toBe(orderId);
			expect(typeof data.getOrder.warehouseStatusText).toBe('string');
			expect(data.orders.map((o) => o.id)).toContain(orderId);
			expect(data.getOrders.map((o) => o.id)).toContain(orderId);
			expect(data.getStoreOrders.map((o) => o.id)).toContain(orderId);
			expect(data.getNextOrderNumber).toBe(2);
			expect(data.getCountOfStoreOrders).toBe(1);
		});

		it('moves the order through the warehouse and carrier statuses', async () => {
			// a carrier status needs a carrier: the carrier app selects the order
			const pyro = new PyroClient();
			try {
				await pyro.call('carrier-orders', 'selectedForDelivery', carrierId, [orderId]);
			} finally {
				pyro.close();
			}

			const warehouseStatus = await gqlData(
				`mutation Status($id: String!) {
					updateOrderWarehouseStatus(orderId: $id, status: PackagingFinished) { id warehouseStatus }
				}`,
				{ id: orderId }
			);
			expect(warehouseStatus.updateOrderWarehouseStatus.warehouseStatus).toBe(6);

			const carrierStatus = await gqlData(
				`mutation Status($id: String!) {
					updateOrderCarrierStatus(orderId: $id, status: CarrierPickedUpOrder) { id carrierStatus }
				}`,
				{ id: orderId }
			);
			expect(carrierStatus.updateOrderCarrierStatus.carrierStatus).toBe(2);

			// statuses never go back
			const back = await gql(
				`mutation Status($id: String!) {
					updateOrderWarehouseStatus(orderId: $id, status: ReadyForProcessing) { id }
				}`,
				{ id: orderId }
			);
			expect(back.errors?.length).toBeGreaterThan(0);
		});

		it('finds the store and its products near the customer (geo queries)', async () => {
			// getCloseMerchants lists only stores in "in store" mode
			const inStore = await createWarehouse(`In-store ${unique()}`, { inStoreMode: true });
			const near = { geoLocation: geoLocation([SOFIA[0] + 0.0001, SOFIA[1] + 0.0001]) };

			const data = await gqlData(
				`query Near($geoLocation: GeoLocationFindInput!) {
					nearbyStores(geoLocation: $geoLocation) { id }
					getCloseMerchants(geoLocation: $geoLocation) { id }
					geoLocationProducts(geoLocation: $geoLocation) { warehouseId distance warehouseProduct { product { id } } }
				}`,
				near
			);

			expect(data.nearbyStores.map((w) => w.id)).toContain(warehouse.id);
			expect(data.nearbyStores.map((w) => w.id)).toContain(inStore.id);
			expect(data.getCloseMerchants.map((w) => w.id)).toContain(inStore.id);
			expect(data.getCloseMerchants.map((w) => w.id)).not.toContain(warehouse.id);

			const info = data.geoLocationProducts.find((p) => p.warehouseId === warehouse.id);
			expect(info.warehouseProduct.product.id).toBe(product.id);
			expect(info.distance).toBeGreaterThanOrEqual(0);
		});

		it('does not find the store from another country', async () => {
			const far = {
				geoLocation: { ...geoLocation([-74.006, 40.7128]), countryId: 230, city: 'New York' },
			};

			const data = await gqlData(
				`query Far($geoLocation: GeoLocationFindInput!) { nearbyStores(geoLocation: $geoLocation) { id } }`,
				far
			);

			expect(data.nearbyStores.map((w) => w.id)).not.toContain(warehouse.id);
		});
	});
});
