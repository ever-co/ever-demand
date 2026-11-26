import crypto from 'crypto';
import { Client, createClient } from 'graphql-ws';
import WebSocket from 'ws';
import {
	ANONYMOUS,
	addProductToWarehouse,
	createCarrier,
	createProduct,
	createWarehouse,
	defaultAdminToken,
	geoLocation,
	gql,
	gqlData,
	PyroClient,
	SOFIA,
	unique,
} from './helpers';
import {
	API_URL,
	BILLING_WEBHOOK_SECRET,
	SUBSCRIPTIONS_URL,
	TENANT_BASE_DOMAIN,
} from './server';

/**
 * Multi-tenant isolation (MULTI_TENANT=true): two tenants, A and B, each with
 * an owner, a store, a product, a category, a promotion, a carrier, a
 * customer (with the SAME email in both), an order and a device. Tenant A
 * must never read or change B's records, whatever ids it knows, over
 * GraphQL, graphql-ws and socket.io. Every by-id check uses B's real ids.
 */

interface TenantFixture {
	slug: string;
	tenantId: string;
	token: string;
	ownerId: string;
	storeId: string;
	storeUsername: string;
	productId: string;
	categoryId: string;
	promotionId: string;
	carrierId: string;
	carrierUsername: string;
	userId: string;
	orderId: string;
	deviceId: string;
}

const SHARED_CUSTOMER_EMAIL = `same_${unique()}@example.com`;

const tenantHeader = (slug: string) => ({ 'Tenant-Id': slug });

async function signup(label: string) {
	const slug = `${label}-${unique()}`;
	const data = await gqlData(
		`mutation Signup($input: TenantSignupInput!) {
			signupTenant(input: $input) {
				token tenant { id slug plan status } admin { id email role tenantId }
			}
		}`,
		{
			input: {
				businessName: `Tenant ${label.toUpperCase()}`,
				slug,
				email: `owner_${slug}@example.com`,
				password: 'owner-password',
				firstName: 'Olga',
				lastName: 'Owner',
			},
		},
		ANONYMOUS
	);

	return data.signupTenant as {
		token: string;
		tenant: { id: string; slug: string; plan: string; status: string };
		admin: { id: string; email: string; role: string; tenantId: string };
	};
}

async function buildTenant(label: string): Promise<TenantFixture> {
	const { token, tenant, admin } = await signup(label);

	const store = await createWarehouse(`Store ${label}`, {}, token);
	const product = await createProduct(`Pizza ${label}`, token);
	await addProductToWarehouse(store.id, product.id, 10, 1000, token);

	const category = await gqlData(
		`mutation C($name: String!) {
			createProductsCategory(createInput: { name: [{ locale: "en-US", value: $name }] }) { id }
		}`,
		{ name: `Category ${label}` },
		token
	);

	// createPromotion answers { success, message, data } in a Promotion shape
	// (an old quirk), so the id is read back from the store's promotions
	await gqlData(
		`mutation P($input: PromotionInput) { createPromotion(createInput: $input) { _id } }`,
		{
			input: {
				title: [{ locale: 'en-US', value: `Promo ${label}` }],
				promoPrice: 9,
				warehouse: { _id: store.id },
				product: product.id,
				active: true,
				purchasesCount: 0,
			},
		},
		token
	);

	const promotions = await gqlData(
		`query P($store: String!) { promotions(findInput: { warehouse: $store }) { _id } }`,
		{ store: store.id },
		token
	);

	const carrier = await createCarrier(`carrier_${label}_${unique()}`, token);

	// a customer of the shop: anonymous, in the tenant of the shop
	const user = await gqlData(
		`mutation R($input: UserRegisterInput!) { registerUser(registerInput: $input) { id email } }`,
		{
			input: {
				user: {
					email: SHARED_CUSTOMER_EMAIL,
					firstName: 'Cara',
					lastName: 'Customer',
					apartment: '1',
					geoLocation: geoLocation(),
				},
				password: 'customer-password',
			},
		},
		ANONYMOUS,
		tenantHeader(tenant.slug)
	);

	const order = await gqlData(
		`mutation O($input: OrderCreateInput!) { createOrder(createInput: $input) { id } }`,
		{
			input: {
				userId: user.registerUser.id,
				warehouseId: store.id,
				products: [{ productId: product.id, count: 1 }],
				options: { autoConfirm: true },
			},
		},
		ANONYMOUS,
		tenantHeader(tenant.slug)
	);

	const pyro = new PyroClient({ tenant: tenant.slug });
	let device: { _id: string };

	try {
		device = await pyro.call('device', 'create', {
			channelId: `channel-${label}-${unique()}`,
			type: 'browser',
			uuid: unique(),
			language: 'en-US',
		});
	} finally {
		pyro.close();
	}

	return {
		slug: tenant.slug,
		tenantId: tenant.id,
		token,
		ownerId: admin.id,
		storeId: store.id,
		storeUsername: store.username,
		productId: product.id,
		categoryId: category.createProductsCategory.id,
		promotionId: promotions.promotions[0]._id,
		carrierId: carrier.id,
		carrierUsername: carrier.username,
		userId: user.registerUser.id,
		orderId: order.createOrder.id,
		deviceId: device._id,
	};
}

/** All `id` / `_id` values anywhere in a GraphQL or socket result. */
function idsIn(value: unknown): Set<string> {
	const ids = new Set<string>();

	const walk = (v: any) => {
		if (Array.isArray(v)) {
			v.forEach(walk);
		} else if (v && typeof v === 'object') {
			for (const [k, x] of Object.entries(v)) {
				if ((k === 'id' || k === '_id') && typeof x === 'string') {
					ids.add(x);
				}
				walk(x);
			}
		}
	};

	walk(value);
	return ids;
}

function idsOf(t: TenantFixture): string[] {
	return [
		t.ownerId,
		t.storeId,
		t.productId,
		t.categoryId,
		t.promotionId,
		t.carrierId,
		t.userId,
		t.orderId,
		t.deviceId,
	];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A Stripe-Signature header for `payload` (what stripe.webhooks.constructEvent checks). */
function stripeSignature(payload: string, secret = BILLING_WEBHOOK_SECRET): string {
	const t = Math.floor(Date.now() / 1000);
	const v1 = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
	return `t=${t},v1=${v1}`;
}

async function postWebhook(event: object, signature?: string) {
	const payload = JSON.stringify(event);
	const res = await fetch(`${API_URL}/api/billing/webhook`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'stripe-signature': signature ?? stripeSignature(payload),
		},
		body: payload,
	});

	return { status: res.status, body: await res.json().catch(() => null) };
}

describe('multi-tenant isolation', () => {
	let A: TenantFixture;
	let B: TenantFixture;

	beforeAll(async () => {
		A = await buildTenant('a');
		B = await buildTenant('b');
	}, 120_000);

	describe('signup and tenant resolution', () => {
		it('signs a business up on the Starter plan with its owner', async () => {
			const data = await gqlData(`{ currentTenant { id slug plan status } }`, {}, A.token);

			expect(data.currentTenant).toEqual({
				id: A.tenantId,
				slug: A.slug,
				plan: 'starter',
				status: 'active',
			});
		});

		it('refuses a taken, reserved or malformed address', async () => {
			const data = await gqlData(
				`query S($a: String!, $b: String!) {
					taken: isTenantSlugAvailable(slug: $a)
					reserved: isTenantSlugAvailable(slug: "admin")
					bad: isTenantSlugAvailable(slug: "No Spaces")
					free: isTenantSlugAvailable(slug: $b)
				}`,
				{ a: A.slug, b: `free-${unique()}` },
				ANONYMOUS
			);

			expect(data).toEqual({ taken: false, reserved: false, bad: false, free: true });

			const res = await gql(
				`mutation { signupTenant(input: { businessName: "Copy", slug: "${A.slug}", email: "x_${unique()}@example.com", password: "long-password" }) { token } }`,
				{},
				ANONYMOUS
			);
			expect(res.errors?.[0].message).toMatch(/taken/);
		});

		it('shows the public info of a tenant by slug, and nothing for unknown ones', async () => {
			const data = await gqlData(
				`query P($slug: String!) { tenantBySlug(slug: $slug) { id name slug } none: tenantBySlug(slug: "no-such-tenant-x") { id } }`,
				{ slug: A.slug },
				ANONYMOUS
			);

			expect(data.tenantBySlug).toEqual({ id: A.tenantId, name: 'Tenant A', slug: A.slug });
			expect(data.none).toBeNull();
		});

		it('answers 404 for an unknown Tenant-Id', async () => {
			const res = await gql(`{ products { id } }`, {}, ANONYMOUS, tenantHeader('nobody-here-x'));

			expect(res.status).toBe(404);
			expect(res.errors?.[0].extensions?.code).toBe('TENANT_NOT_FOUND');
		});

		it('refuses tenant data when no tenant is given', async () => {
			const res = await gql(`{ products { id } }`, {}, ANONYMOUS);
			expect(res.errors?.[0].message).toMatch(/No tenant/);
		});

		it('resolves the tenant by id or slug in the header, and by the page origin', async () => {
			const byId = await gqlData(`{ products { id } }`, {}, ANONYMOUS, tenantHeader(A.tenantId));
			const bySlug = await gqlData(`{ products { id } }`, {}, ANONYMOUS, tenantHeader(A.slug));
			const byOrigin = await gqlData(`{ products { id } }`, {}, ANONYMOUS, {
				origin: `https://${B.slug}.${TENANT_BASE_DOMAIN}`,
			});

			for (const data of [byId, bySlug]) {
				expect(data.products.map((p) => p.id)).toEqual([A.productId]);
			}
			expect(byOrigin.products.map((p) => p.id)).toEqual([B.productId]);
		});

		it('lets the token win over the origin', async () => {
			const data = await gqlData(`{ currentTenant { id } }`, {}, A.token, {
				origin: `https://${B.slug}.${TENANT_BASE_DOMAIN}`,
			});

			expect(data.currentTenant.id).toBe(A.tenantId);
		});

		it("refuses A's login with B's Tenant-Id (403)", async () => {
			const res = await gql(`{ currentTenant { id } }`, {}, A.token, tenantHeader(B.slug));

			expect(res.status).toBe(403);
			expect(res.errors?.[0].extensions?.code).toBe('TENANT_FORBIDDEN');
		});
	});

	describe('GraphQL: A never reads B', () => {
		it('lists only its own records', async () => {
			const data = await gqlData(
				`query {
					warehouses { id }
					getAllStores { id }
					products { id }
					productsCategories { id }
					promotions(findInput: { warehouse: "${A.storeId}" }) { _id }
					getCarriers { id }
					users { id }
					devices { id }
					tenantMembers { id }
				}`,
				{},
				A.token
			);

			expect(data.promotions.map((p) => p._id)).toEqual([A.promotionId]);

			const seen = idsIn(data);

			for (const id of idsOf(B)) {
				expect(seen.has(id)).toBe(false);
			}

			expect(data.warehouses.map((w) => w.id)).toEqual([A.storeId]);
			expect(data.products.map((p) => p.id)).toEqual([A.productId]);
			expect(data.users.map((u) => u.id)).toEqual([A.userId]);
			expect(data.getCarriers.map((c) => c.id)).toEqual([A.carrierId]);
			expect(data.tenantMembers.map((m) => m.id)).toEqual([A.ownerId]);
		});

		it("gets nothing for B's ids", async () => {
			const data = await gqlData(
				`query R($store: String!, $product: String!, $category: String!, $user: String!, $order: String!, $carrier: String!, $device: String!, $admin: String!) {
					warehouse(id: $store) { id }
					product(id: $product) { id }
					productsCategory(id: $category) { id }
					user(id: $user) { id }
					getOrder(id: $order) { id }
					getCarrier(id: $carrier) { id }
					device(id: $device) { id }
					admin(id: $admin) { id }
					getStoreProducts(storeId: $store, fullProducts: true) { product { id } }
					getStoreOrders(storeId: $store) { id }
					getOrders(userId: $user) { id }
					promotions(findInput: { warehouse: $store }) { _id }
				}`,
				{
					store: B.storeId,
					product: B.productId,
					category: B.categoryId,
					user: B.userId,
					order: B.orderId,
					carrier: B.carrierId,
					device: B.deviceId,
					admin: B.ownerId,
				},
				A.token
			).catch((err) => ({ error: String(err) }));

			const seen = idsIn(data);

			for (const id of idsOf(B)) {
				expect(seen.has(id)).toBe(false);
			}
		});

		it("cannot change or delete B's records", async () => {
			const attempts = [
				gql(`mutation M($id: String!) { updateCarrier(id: $id, updateInput: { firstName: "Mallory" }) { id } }`, { id: B.carrierId }, A.token),
				gql(`mutation M($id: String!) { removeProductsByIds(ids: [$id]) { n } }`, { id: B.productId }, A.token),
				gql(`mutation M($id: String!) { removeWarehousesByIds(ids: [$id]) }`, { id: B.storeId }, A.token),
				gql(`mutation M($id: String!) { banUser(id: $id) { id } }`, { id: B.userId }, A.token),
				gql(`mutation M($id: String!) { updateOrderWarehouseStatus(orderId: $id, status: PackagingFinished) { id } }`, { id: B.orderId }, A.token),
				gql(`mutation M($id: String!) { removeProductsCategoriesByIds(ids: [$id]) { n } }`, { id: B.categoryId }, A.token),
				gql(`mutation M($id: String!) { removePromotionsByIds(ids: [$id]) { n } }`, { id: B.promotionId }, A.token),
				gql(`mutation M($id: String!) { updateAdmin(id: $id, updateInput: { name: "Mallory" }) { id } }`, { id: B.ownerId }, A.token),
				gql(`mutation M($id: String!) { removeDeviceByIds(ids: [$id]) { n } }`, { id: B.deviceId }, A.token),
				gql(
					`mutation M($store: String!, $product: String!) {
						addWarehouseProducts(warehouseId: $store, products: [{ product: $product, price: 1, initialPrice: 1, count: 1 }]) { id }
					}`,
					{ store: B.storeId, product: A.productId },
					A.token
				),
			];

			const results = await Promise.all(attempts);

			for (const res of results) {
				// each attempt is a valid operation that the tenant layer refuses or misses
				expect((res.errors ?? []).map((e) => e.extensions?.code)).not.toContain(
					'GRAPHQL_VALIDATION_FAILED'
				);
				expect(idsIn(res.data).has(B.storeId)).toBe(false);
			}

			// B sees all of its records unchanged
			const data = await gqlData(
				`query R($store: String!, $product: String!, $user: String!, $order: String!, $carrier: String!, $admin: String!) {
					warehouses { id }
					product(id: $product) { id }
					user(id: $user) { id isBanned }
					getOrder(id: $order) { id warehouseStatus }
					getCarrier(id: $carrier) { id firstName }
					admin(id: $admin) { id name }
					productsCategories { id }
					promotions(findInput: { warehouse: $store }) { _id }
					devices { id }
					getStoreProducts(storeId: $store, fullProducts: true) { product { id } }
				}`,
				{
					store: B.storeId,
					product: B.productId,
					user: B.userId,
					order: B.orderId,
					carrier: B.carrierId,
					admin: B.ownerId,
				},
				B.token
			);

			expect(data.warehouses.map((w) => w.id)).toEqual([B.storeId]);
			expect(data.product.id).toBe(B.productId);
			expect(data.user).toEqual({ id: B.userId, isBanned: false });
			expect(data.getOrder).toEqual({ id: B.orderId, warehouseStatus: 0 });
			expect(data.getCarrier).toEqual({ id: B.carrierId, firstName: 'Carl' });
			expect(data.admin.name).not.toBe('Mallory');
			expect(data.productsCategories.map((c) => c.id)).toEqual([B.categoryId]);
			expect(data.promotions.map((p) => p._id)).toEqual([B.promotionId]);
			expect(data.devices.map((d) => d.id)).toEqual([B.deviceId]);
			expect(data.getStoreProducts.map((p) => p.product.id)).toEqual([B.productId]);
		});

		it("cannot order from B's store in its own shop", async () => {
			const res = await gql(
				`mutation O($input: OrderCreateInput!) { createOrder(createInput: $input) { id } }`,
				{
					input: {
						userId: A.userId,
						warehouseId: B.storeId,
						products: [{ productId: B.productId, count: 1 }],
					},
				},
				ANONYMOUS,
				tenantHeader(A.slug)
			);

			expect(res.errors?.length).toBeGreaterThan(0);
			expect(res.data?.createOrder ?? null).toBeNull();
		});

		it('shows the shop of each tenant only its own stores and products near the customer', async () => {
			const near = { geoLocation: geoLocation([SOFIA[0] + 0.0001, SOFIA[1] + 0.0001]) };
			const query = `query N($geoLocation: GeoLocationFindInput!) {
				geoLocationProducts(geoLocation: $geoLocation) { warehouseId warehouseProduct { product { id } } }
			}`;

			const inA = await gqlData(query, near, ANONYMOUS, tenantHeader(A.slug));
			const inB = await gqlData(query, near, ANONYMOUS, tenantHeader(B.slug));

			expect(new Set(inA.geoLocationProducts.map((p) => p.warehouseId))).toEqual(new Set([A.storeId]));
			expect(new Set(inB.geoLocationProducts.map((p) => p.warehouseId))).toEqual(new Set([B.storeId]));
		});

		it('keeps admin operations from anonymous callers and from other roles', async () => {
			const anonymous = await gql(`{ users { id } }`, {}, ANONYMOUS, tenantHeader(A.slug));
			expect(anonymous.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');

			const carrierLogin = await gqlData(
				`mutation L($u: String!) { carrierLogin(username: $u, password: "carrier-password") { token } }`,
				{ u: A.carrierUsername },
				ANONYMOUS
			);
			const asCarrier = await gql(`{ users { id } }`, {}, carrierLogin.carrierLogin.token);
			expect(asCarrier.errors?.[0].extensions?.code).toBe('FORBIDDEN');
		});
	});

	describe('logins and uniqueness', () => {
		it('lets the same customer email exist in two tenants, each logging in to its own', async () => {
			const login = async (slug: string) =>
				gqlData(
					`mutation L($e: String!) { userLogin(email: $e, password: "customer-password") { user { id } } }`,
					{ e: SHARED_CUSTOMER_EMAIL },
					ANONYMOUS,
					tenantHeader(slug)
				);

			expect((await login(A.slug)).userLogin.user.id).toBe(A.userId);
			expect((await login(B.slug)).userLogin.user.id).toBe(B.userId);
		});

		it('keeps store usernames unique across tenants', async () => {
			const res = await gql(
				`mutation R($input: WarehouseRegisterInput!) { registerWarehouse(registerInput: $input) { id } }`,
				{
					input: {
						password: 'store-password',
						warehouse: {
							name: 'Copycat',
							username: A.storeUsername,
							logo: 'https://example.com/logo.png',
							contactEmail: `copy_${unique()}@example.com`,
							geoLocation: geoLocation(),
							isActive: true,
							isPaymentEnabled: false,
							inStoreMode: false,
							carrierCompetition: false,
							hasRestrictedCarriers: false,
							isCarrierRequired: true,
							isManufacturing: true,
						},
					},
				},
				B.token
			);

			expect(res.errors?.length).toBeGreaterThan(0);
		});

		it("logs a carrier in from anywhere, but not on another tenant's host", async () => {
			const query = `mutation L($u: String!) { carrierLogin(username: $u, password: "carrier-password") { token carrier { id } } }`;

			const plain = await gqlData(query, { u: A.carrierUsername }, ANONYMOUS);
			const ownHost = await gqlData(query, { u: A.carrierUsername }, ANONYMOUS, tenantHeader(A.slug));
			const otherHost = await gqlData(query, { u: A.carrierUsername }, ANONYMOUS, tenantHeader(B.slug));

			expect(plain.carrierLogin.carrier.id).toBe(A.carrierId);
			expect(ownHost.carrierLogin.carrier.id).toBe(A.carrierId);
			expect(otherHost.carrierLogin).toBeNull();
		});

		it("puts the owner's tenant in the token of a login without a tenant", async () => {
			const login = await gqlData(
				`mutation L($e: String!) { adminLogin(email: $e, password: "owner-password") { token admin { role tenantId } } }`,
				{ e: `owner_${A.slug}@example.com` },
				ANONYMOUS
			);

			expect(login.adminLogin.admin).toEqual({ role: 'owner', tenantId: A.tenantId });

			const data = await gqlData(`{ currentTenant { id } }`, {}, login.adminLogin.token);
			expect(data.currentTenant.id).toBe(A.tenantId);
		});
	});

	describe('roles', () => {
		let staffToken: string;

		beforeAll(async () => {
			const email = `staff_${unique()}@example.com`;

			await gqlData(
				`mutation R($input: AdminRegisterInput!) { registerAdmin(registerInput: $input) { id role } }`,
				{
					input: {
						admin: { name: 'Sam Staff', email, pictureUrl: 'https://example.com/s.png', role: 'staff' },
						password: 'staff-password',
					},
				},
				A.token
			);

			const login = await gqlData(
				`mutation L($e: String!) { adminLogin(email: $e, password: "staff-password") { token admin { role } } }`,
				{ e: email },
				ANONYMOUS
			);

			expect(login.adminLogin.admin.role).toBe('staff');
			staffToken = login.adminLogin.token;
		});

		it("keeps staff from editing another admin's account", async () => {
			const res = await gql(
				`mutation U($id: String!) { updateAdmin(id: $id, updateInput: { email: "taken_${unique()}@example.com" }) { id } }`,
				{ id: A.ownerId },
				staffToken
			);

			expect(res.errors?.[0].extensions?.code).toBe('FORBIDDEN');
		});

		it('lets staff work but not manage members, settings or billing', async () => {
			const usage = await gqlData(`{ tenantUsage { members } }`, {}, staffToken);
			expect(usage.tenantUsage.members).toBeGreaterThanOrEqual(3);

			for (const op of [
				`mutation { registerAdmin(registerInput: { admin: { name: "X", email: "x_${unique()}@example.com", pictureUrl: "p" }, password: "long-password" }) { id } }`,
				`mutation { updateTenant(input: { name: "Renamed" }) { id } }`,
				`mutation { createBillingCheckout(input: { plan: "small_business", interval: "monthly" }) { url } }`,
			]) {
				const res = await gql(op, {}, staffToken);
				expect(res.errors?.[0].extensions?.code).toBe('FORBIDDEN');
			}
		});

		it('keeps staff from adding stores, carriers or removing customers', async () => {
			for (const op of [
				`mutation { removeUsersByIds(ids: ["${A.userId}"]) }`,
				`mutation { removeWarehousesByIds(ids: ["${A.storeId}"]) }`,
				`mutation { banUser(id: "${A.userId}") { id } }`,
			]) {
				const res = await gql(op, {}, staffToken);
				expect(res.errors?.[0].extensions?.code).toBe('FORBIDDEN');
			}
		});

		it('never lets an owner or admin grant super-admin or move a record to another tenant', async () => {
			const email = `sneaky_${unique()}@example.com`;
			const res = await gqlData(
				`mutation R($input: AdminRegisterInput!) { registerAdmin(registerInput: $input) { id role isSuperAdmin tenantId } }`,
				{
					input: {
						admin: { name: 'Sneaky', email, pictureUrl: 'p', role: 'owner' },
						password: 'long-password',
					},
				},
				A.token
			);

			expect(res.registerAdmin).toMatchObject({ role: 'admin', isSuperAdmin: false, tenantId: A.tenantId });
		});
	});

	describe('platform super-admin', () => {
		it('shows billing and the owner of a tenant to its admins only', async () => {
			const asShop = await gqlData(`{ currentTenant { id ownerId billing { status } } }`, {}, ANONYMOUS, tenantHeader(A.slug));
			const asOwner = await gqlData(`{ currentTenant { id ownerId billing { hasSubscription } } }`, {}, A.token);

			expect(asShop.currentTenant).toEqual({ id: A.tenantId, ownerId: null, billing: null });
			expect(asOwner.currentTenant).toEqual({ id: A.tenantId, ownerId: A.ownerId, billing: { hasSubscription: false } });
		});

		it('lists every tenant and switches into one with the Tenant-Id header', async () => {
			const superToken = await defaultAdminToken();

			const list = await gqlData(`{ tenants { tenant { id slug } members stores } }`, {}, superToken);
			const slugs = list.tenants.map((t) => t.tenant.slug);
			expect(slugs).toEqual(expect.arrayContaining([A.slug, B.slug, 'default']));

			const inB = await gqlData(`{ warehouses { id } currentTenant { id } }`, {}, superToken, tenantHeader(B.slug));
			expect(inB.currentTenant.id).toBe(B.tenantId);
			expect(inB.warehouses.map((w) => w.id)).toEqual([B.storeId]);
		});

		it('keeps REST controllers closed to anonymous callers', async () => {
			const res = await fetch(`${API_URL}/api/product/x`, {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'Tenant-Id': B.slug },
				body: JSON.stringify({ title: [{ locale: 'en-US', value: 'Spam' }] }),
			});

			expect(res.status).toBe(401);
		});

		it('keeps the tenant list from tenant owners', async () => {
			const res = await gql(`{ tenants { tenant { id } } }`, {}, A.token);
			expect(res.errors?.[0].extensions?.code).toBe('FORBIDDEN');
		});
	});

	describe('plan limits', () => {
		it('stops a Starter tenant at 3 stores and tells it to upgrade', async () => {
			const c = await signup('limits');

			for (let i = 0; i < 3; i++) {
				await createWarehouse(`Limit ${i}`, {}, c.token);
			}

			const res = await gql(
				`mutation R($input: WarehouseRegisterInput!) { registerWarehouse(registerInput: $input) { id } }`,
				{
					input: {
						password: 'store-password',
						warehouse: {
							name: 'One too many',
							username: `store_${unique()}`,
							logo: 'https://example.com/logo.png',
							contactEmail: `many_${unique()}@example.com`,
							geoLocation: geoLocation(),
							isActive: true,
							isPaymentEnabled: false,
							inStoreMode: false,
							carrierCompetition: false,
							hasRestrictedCarriers: false,
							isCarrierRequired: true,
							isManufacturing: true,
						},
					},
				},
				c.token
			);

			expect(res.errors?.[0].message).toMatch(/Starter plan allows 3 stores/);

			const usage = await gqlData(`{ tenantUsage { stores storeLimit members memberLimit } }`, {}, c.token);
			expect(usage.tenantUsage).toEqual({ stores: 3, storeLimit: 3, members: 4, memberLimit: 15 });
		});
	});

	describe('billing webhooks', () => {
		const subscriptionEvent = (
			id: string,
			tenantId: string,
			customer: string,
			type = 'customer.subscription.updated'
		) => ({
			id,
			object: 'event',
			type,
			data: {
				object: {
					id: `sub_${unique()}`,
					object: 'subscription',
					customer,
					status: 'trialing',
					trial_end: Math.floor(Date.now() / 1000) + 90 * 86400,
					metadata: { tenantId },
					items: {
						data: [
							{
								price: { lookup_key: 'ever_demand_cloud_small_business_monthly' },
								quantity: 1,
								current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
							},
							{
								price: { lookup_key: 'ever_seat_demand_cloud_small_business_monthly' },
								quantity: 5,
							},
						],
					},
				},
			},
		});

		it('refuses an event without a valid signature', async () => {
			const event = subscriptionEvent(`evt_${unique()}`, A.tenantId, 'cus_x');

			expect((await postWebhook(event, 't=1,v1=deadbeef')).status).toBe(400);
			expect((await postWebhook(event, stripeSignature(JSON.stringify(event), 'whsec_wrong'))).status).toBe(400);

			const data = await gqlData(`{ currentTenant { plan } }`, {}, A.token);
			expect(data.currentTenant.plan).toBe('starter');
		});

		it('moves the tenant to the plan of its subscription, once per event', async () => {
			const d = await signup('billing');
			const event = subscriptionEvent(`evt_${unique()}`, d.tenant.id, `cus_${unique()}`);

			const first = await postWebhook(event);
			expect(first).toEqual({ status: 200, body: { received: true, applied: true } });

			const replay = await postWebhook(event);
			expect(replay.body.applied).toBe(false);

			const data = await gqlData(
				`{ currentTenant { plan billing { status extraMembers hasSubscription } } tenantUsage { memberLimit storeLimit } }`,
				{},
				d.token
			);

			expect(data.currentTenant).toEqual({
				plan: 'small_business',
				billing: { status: 'trialing', extraMembers: 5, hasSubscription: true },
			});
			expect(data.tenantUsage).toEqual({ memberLimit: 30, storeLimit: 3 });

			// an event of another Stripe customer cannot take the tenant over
			const hijack = subscriptionEvent(`evt_${unique()}`, d.tenant.id, `cus_other_${unique()}`);
			hijack.data.object.items.data[1].quantity = 500;
			await postWebhook(hijack);

			const after = await gqlData(`{ currentTenant { billing { extraMembers } } }`, {}, d.token);
			expect(after.currentTenant.billing.extraMembers).toBe(5);
		});

		it('ignores events it does not handle', async () => {
			const res = await postWebhook({ id: `evt_${unique()}`, object: 'event', type: 'charge.succeeded', data: { object: {} } });
			expect(res.body).toEqual({ received: true, applied: false });
		});

		it('refuses Checkout for a free plan before calling Stripe', async () => {
			const res = await gql(`mutation { createBillingCheckout(input: { plan: "starter", interval: "monthly" }) { url } }`, {}, A.token);
			expect(res.errors?.[0].message).toMatch(/paid plan/);
		});
	});

	describe('socket.io: A never reads B', () => {
		let pyroA: PyroClient;

		beforeAll(() => {
			pyroA = new PyroClient({ tenant: A.slug });
		});

		afterAll(() => pyroA.close());

		it("gets nothing of B's for B's ids", async () => {
			const streams = await Promise.all([
				pyroA.observe('warehouse', 'get', B.storeId, false),
				pyroA.observe('order', 'get', B.orderId),
				pyroA.observe('user', 'get', B.userId),
				pyroA.observe('user-orders', 'get', B.userId),
				pyroA.observe('warehouse-products', 'get', B.storeId),
			]);

			await sleep(1500);

			for (const stream of streams) {
				const seen = idsIn(stream.values);
				for (const id of idsOf(B)) {
					expect(seen.has(id)).toBe(false);
				}
				stream.unsubscribe();
			}
		});

		it('finds only its own stores near the customer', async () => {
			const stores = await pyroA.observe<any[]>('geo-location-warehouses', 'get', geoLocation(), {
				activeOnly: false,
			});

			const first = await stores.next((v) => Array.isArray(v));
			expect(first.map((w) => w._id)).toEqual([A.storeId]);
			stores.unsubscribe();
		});

		it("streams A's own changes and never B's", async () => {
			const near = await pyroA.observe<any[]>('geo-location-warehouses', 'get', geoLocation(), {
				activeOnly: false,
			});
			const ownOrder = await pyroA.observe<any>('order', 'get', A.orderId);
			const foreignOrder = await pyroA.observe<any>('order', 'get', B.orderId);

			await near.next((v) => Array.isArray(v));
			await ownOrder.next((v) => v?._id === A.orderId);

			// B: a new store at the same place, and a status change of its order
			const bStore = await createWarehouse('B nearby', {}, B.token);
			await gqlData(
				`mutation M($id: String!) { updateOrderWarehouseStatus(orderId: $id, status: PackagingFinished) { id } }`,
				{ id: B.orderId },
				B.token
			);

			// A: a status change of its own order, then a new store (positive controls)
			await gqlData(
				`mutation M($id: String!) { updateOrderWarehouseStatus(orderId: $id, status: PackagingFinished) { id } }`,
				{ id: A.orderId },
				A.token
			);
			await ownOrder.next((v) => v?.warehouseStatus === 6);

			const aStore = await createWarehouse('A second', {}, A.token);
			const updated = await near.next((v) => Array.isArray(v) && v.some((w) => w._id === aStore.id));

			expect(updated.map((w) => w._id).sort()).toEqual([A.storeId, aStore.id].sort());

			await sleep(1000);

			const seen = idsIn([near.values, ownOrder.values, foreignOrder.values]);
			expect(seen.has(bStore.id)).toBe(false);
			expect(seen.has(B.storeId)).toBe(false);
			expect(seen.has(B.orderId)).toBe(false);

			near.unsubscribe();
			ownOrder.unsubscribe();
			foreignOrder.unsubscribe();
		});

		it('creates records in the tenant of the socket', async () => {
			const user = await pyroA.call<{ _id: string }>('user-auth', 'register', {
				user: {
					email: `socket_${unique()}@example.com`,
					firstName: 'Sock',
					lastName: 'Et',
					apartment: '2',
					geoLocation: geoLocation(),
				},
				password: 'socket-password',
			});

			const inA = await gqlData(`query U($id: String!) { user(id: $id) { id } }`, { id: user._id }, A.token);
			const inB = await gql(`query U($id: String!) { user(id: $id) { id } }`, { id: user._id }, B.token);

			expect(inA.user.id).toBe(user._id);
			// B is told the customer does not exist
			expect(inB.data?.user ?? null).toBeNull();
		});

		it("refuses a socket with A's login and B's tenant", async () => {
			const pyro = new PyroClient({ token: A.token, tenant: B.slug });

			try {
				await expect(pyro.connect('warehouse')).rejects.toMatchObject({
					message: expect.stringMatching(/another tenant/),
				});
			} finally {
				pyro.close();
			}
		});

		it("keeps an anonymous socket from B's store and order actions", async () => {
			const anonymousB = new PyroClient({ tenant: B.slug });

			try {
				await expect(
					anonymousB.call('warehouse', 'register', {
						warehouse: { name: 'Mallory', username: `mallory_${unique()}`, geoLocation: geoLocation() },
						password: 'mallory-password',
					})
				).rejects.toThrow(/Log in to use warehouse.register/);
				await expect(anonymousB.call('order', 'paid', B.orderId)).rejects.toThrow(/Log in/);
				await expect(
					anonymousB.call('warehouse-products', 'changePrice', B.storeId, B.productId, 0)
				).rejects.toThrow(/Log in/);
				await expect(
					anonymousB.call('carrier', 'updateById', B.carrierId, { firstName: 'Mallory' })
				).rejects.toThrow(/Log in/);
			} finally {
				anonymousB.close();
			}

			const data = await gqlData(
				`query R($c: String!) { warehouses { id } getCarrier(id: $c) { firstName } getOrder(id: "${B.orderId}") { isPaid } }`,
				{ c: B.carrierId },
				B.token
			);
			expect(data.warehouses.map((w) => w.id)).toEqual([B.storeId]);
			expect(data.getCarrier.firstName).toBe('Carl');
			expect(data.getOrder.isPaid).toBe(false);
		});

		it("lets a logged-in store socket do store actions in its own tenant only", async () => {
			const login = await gqlData(
				`mutation L($u: String!) { warehouseLogin(username: $u, password: "store-password") { token } }`,
				{ u: A.storeUsername },
				ANONYMOUS
			);
			const storeA = new PyroClient({ token: login.warehouseLogin.token });

			try {
				await storeA.call('warehouse-products', 'changePrice', A.storeId, A.productId, 1100);
				// B's store is not found in A's tenant
				await expect(
					storeA.call('warehouse-products', 'changePrice', B.storeId, B.productId, 1)
				).rejects.toThrow();
			} finally {
				storeA.close();
			}

			const prices = await gqlData(
				`query P($a: String!) { getStoreProducts(storeId: $a, fullProducts: false) { price } }`,
				{ a: A.storeId },
				A.token
			);
			expect(prices.getStoreProducts[0].price).toBe(1100);

			const priceB = await gqlData(
				`query P($b: String!) { getStoreProducts(storeId: $b, fullProducts: false) { price } }`,
				{ b: B.storeId },
				B.token
			);
			expect(priceB.getStoreProducts[0].price).toBe(1000);
		});

		it('never lets a client set the Stripe customer of a customer', async () => {
			await pyroA.call('user', 'updateUser', A.userId, { stripeCustomerId: 'cus_someone_else' });
			await gql(
				`mutation U($id: String!) { updateUser(id: $id, updateObject: { stripeCustomerId: "cus_someone_else", geoLocation: { countryId: 33, city: "Sofia", streetAddress: "Vitosha Blvd", house: "1", loc: { type: "Point", coordinates: [23.3219, 42.6977] } } }) { id } }`,
				{ id: A.userId },
				ANONYMOUS,
				tenantHeader(A.slug)
			);

			const user = await new Promise<any>((resolve, reject) => {
				pyroA.observe('user', 'get', A.userId).then((stream) =>
					stream.next((v) => v?._id === A.userId).then((v) => {
						stream.unsubscribe();
						resolve(v);
					}, reject)
				, reject);
			});

			expect(user.stripeCustomerId ?? null).toBeNull();
		});

		it('refuses tenant data on a socket without a tenant', async () => {
			const pyro = new PyroClient();

			try {
				await expect(
					pyro.call('user-auth', 'register', {
						user: { email: `none_${unique()}@example.com`, apartment: '3', geoLocation: geoLocation() },
						password: 'none-password',
					})
				).rejects.toThrow(/No tenant/);
			} finally {
				pyro.close();
			}
		});
	});

	describe('graphql-ws: subscriptions stay in the tenant', () => {
		const clients: Client[] = [];

		afterAll(async () => {
			await Promise.all(clients.map((c) => c.dispose()));
		});

		it("delivers A's device updates to A, never B's", async () => {
			const client = createClient({
				url: SUBSCRIPTIONS_URL,
				webSocketImpl: WebSocket,
				connectionParams: { authorization: `Bearer ${A.token}` },
				retryAttempts: 0,
				lazy: true,
			});
			clients.push(client);

			const events: any[] = [];
			const gotOwn = new Promise<void>((resolve, reject) => {
				client.subscribe(
					{ query: `subscription { deviceCreated { id } }` },
					{
						next: (value) => {
							const id = (value.data as any)?.deviceCreated?.id;
							events.push(id);
							if (id === A.deviceId) resolve();
						},
						error: reject,
						complete: () => undefined,
					}
				);
			});

			const update = (id: string, token: string) =>
				gqlData(
					`mutation U($id: String!) { updateDevice(id: $id, updateInput: { language: "he-IL" }) { id } }`,
					{ id },
					token
				);

			const timer = setInterval(() => {
				update(B.deviceId, B.token).catch(() => undefined);
				update(A.deviceId, A.token).catch(() => undefined);
			}, 300);

			try {
				await gotOwn;
			} finally {
				clearInterval(timer);
			}

			await sleep(500);
			expect(events).not.toContain(B.deviceId);
		});
	});
});
