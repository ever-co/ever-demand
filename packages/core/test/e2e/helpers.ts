import { randomUUID } from 'crypto';
import { io, Socket } from 'socket.io-client';
import { GQL_URL, SERVICES_URL } from './server';

export interface GqlResponse<T> {
	status: number;
	data?: T;
	errors?: { message: string; extensions?: Record<string, unknown> }[];
}

/** Pass as the token to send an operation without logging in. */
export const ANONYMOUS = null;

let cachedAdminToken: Promise<string> | undefined;

/**
 * Login token of the default admin (admin@ever.co / admin). Operations that
 * set up data are admin-only (graphql/access), so gql() sends it unless told
 * otherwise.
 */
export function defaultAdminToken(): Promise<string> {
	cachedAdminToken ??= (async () => {
		const res = await fetch(GQL_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				query: `mutation { adminLogin(email: "admin@ever.co", password: "admin") { token } }`,
			}),
		});
		const body: any = await res.json();
		const token = body?.data?.adminLogin?.token;

		if (!token) {
			cachedAdminToken = undefined;
			throw new Error(`default admin could not log in: ${JSON.stringify(body)}`);
		}

		return token;
	})();

	return cachedAdminToken;
}

/**
 * POST a GraphQL operation to the API, the way apollo-angular does.
 * `token`: undefined = the default admin, null (ANONYMOUS) = no login,
 * else that login token. `headers`: extra headers, e.g. `Tenant-Id`.
 */
export async function gql<T = any>(
	query: string,
	variables: Record<string, unknown> = {},
	token?: string | null,
	headers: Record<string, string> = {}
): Promise<GqlResponse<T>> {
	const bearer = token === undefined ? await defaultAdminToken() : token;

	const res = await fetch(GQL_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
			...headers,
		},
		body: JSON.stringify({ query, variables }),
	});

	const text = await res.text();
	let body: any;

	try {
		body = JSON.parse(text);
	} catch {
		body = { errors: [{ message: text }] };
	}

	// the tenant middleware answers before GraphQL: { statusCode, code, message }
	if (body && body.errors == null && body.data == null && body.message) {
		body = { errors: [{ message: body.message, extensions: { code: body.code } }] };
	}

	return { status: res.status, ...body };
}

/** Like gql(), but fails the test on GraphQL errors and returns `data`. */
export async function gqlData<T = any>(
	query: string,
	variables: Record<string, unknown> = {},
	token?: string | null,
	headers: Record<string, string> = {}
): Promise<T> {
	const res = await gql<T>(query, variables, token, headers);

	if (res.errors?.length || res.data == null) {
		throw new Error(
			`GraphQL failed (HTTP ${res.status}): ${JSON.stringify(res.errors)}`
		);
	}

	return res.data;
}

/** Unique suffix for names, emails and usernames of one test run. */
export const unique = () => randomUUID().slice(0, 8);

/** A point in Sofia; geo queries search around it. */
export const SOFIA: [number, number] = [23.3219, 42.6977];

export function geoLocation(
	coordinates: [number, number] = SOFIA,
	house = '1'
) {
	return {
		countryId: 33, // Bulgaria
		city: 'Sofia',
		streetAddress: 'Vitosha Blvd',
		house,
		loc: { type: 'Point', coordinates },
	};
}

/**
 * Client of the socket.io "pyro" routers, as used by the apps
 * (common-angular/src/lib/router): one socket.io namespace per router,
 * one event per listener method.
 */
export class PyroClient {
	private readonly sockets = new Map<string, Socket>();

	/**
	 * `auth`: the socket.io handshake `auth` of every connection, e.g.
	 * `{ tenant: 'acme' }` or `{ token }` (DESIGN.md §3.3).
	 */
	constructor(private readonly auth: Record<string, string> = {}) {}

	private async socket(router: string): Promise<Socket> {
		let socket = this.sockets.get(router);

		if (!socket) {
			socket = io(`${SERVICES_URL}/${router}`, {
				reconnection: false,
				forceNew: true,
				auth: this.auth,
			});
			this.sockets.set(router, socket);
		}

		if (!socket.connected) {
			await new Promise<void>((resolve, reject) => {
				socket.once('connect', () => resolve());
				socket.once('connect_error', reject);
			});
		}

		return socket;
	}

	/** Calls an @asyncListener: resolves with its result, rejects with its error. */
	async call<T = any>(router: string, method: string, ...args: unknown[]): Promise<T> {
		const socket = await this.socket(router);

		return new Promise<T>((resolve, reject) => {
			socket.emit(method, ...args, (err: any, res: T) => {
				if (err != null) {
					const error = new Error(err.message ?? JSON.stringify(err));
					error.name = err.name ?? 'Error';
					reject(error);
				} else {
					resolve(res);
				}
			});
		});
	}

	/**
	 * Subscribes to an @observableListener and returns the values it emits.
	 * `next()` waits for the next one that matches `predicate`.
	 */
	async observe<T = any>(router: string, method: string, ...args: unknown[]) {
		const socket = await this.socket(router);
		const callId = randomUUID();
		const subscriptionId = randomUUID();

		const values: T[] = [];
		let waiting: { predicate: (v: T) => boolean; resolve: (v: T) => void } | undefined;

		socket.on(`${subscriptionId}_next`, (value: T) => {
			values.push(value);
			if (waiting && waiting.predicate(value)) {
				const { resolve } = waiting;
				waiting = undefined;
				resolve(value);
			}
		});

		socket.emit(method, ...args, callId);
		socket.emit(`${callId}_subscribe`, subscriptionId);

		return {
			values,
			next(predicate: (v: T) => boolean = () => true, timeoutMs = 15000): Promise<T> {
				const found = values.find(predicate);
				if (found !== undefined) {
					return Promise.resolve(found);
				}
				return new Promise<T>((resolve, reject) => {
					const timer = setTimeout(
						() => reject(new Error(`no matching ${router}.${method} value within ${timeoutMs}ms`)),
						timeoutMs
					);
					waiting = {
						predicate,
						resolve: (v) => {
							clearTimeout(timer);
							resolve(v);
						},
					};
				});
			},
			unsubscribe() {
				socket.emit(`${subscriptionId}_unsubscribe`);
				socket.off(`${subscriptionId}_next`);
			},
		};
	}

	close() {
		for (const socket of this.sockets.values()) {
			socket.close();
		}
		this.sockets.clear();
	}
}

// ---- fixtures created through the public API ----

export async function adminToken(): Promise<string> {
	const data = await gqlData<{ adminLogin: { token: string } | null }>(
		`mutation Login($email: String!, $password: String!) {
			adminLogin(email: $email, password: $password) { token }
		}`,
		{ email: 'admin@ever.co', password: 'admin' },
		ANONYMOUS
	);

	if (!data.adminLogin) {
		throw new Error('default admin could not log in');
	}

	return data.adminLogin.token;
}

export async function createWarehouse(
	name = `Store ${unique()}`,
	overrides: Record<string, unknown> = {}
) {
	const id = unique();
	const data = await gqlData<{ registerWarehouse: { id: string; name: string; username: string } }>(
		`mutation Register($registerInput: WarehouseRegisterInput!) {
			registerWarehouse(registerInput: $registerInput) { id name username }
		}`,
		{
			registerInput: {
				password: 'store-password',
				warehouse: {
					name,
					username: `store_${id}`,
					logo: 'https://example.com/logo.png',
					contactEmail: `store_${id}@example.com`,
					geoLocation: geoLocation(),
					isActive: true,
					isPaymentEnabled: false,
					inStoreMode: false,
					carrierCompetition: false,
					hasRestrictedCarriers: false,
					isCarrierRequired: true,
					isManufacturing: true,
					...overrides,
				},
			},
		}
	);

	return data.registerWarehouse;
}

export async function createProduct(title = `Pizza ${unique()}`) {
	const data = await gqlData<{ createProduct: { id: string; title: { locale: string; value: string }[] } }>(
		`mutation Create($product: ProductCreateInput!) {
			createProduct(product: $product) { id title { locale value } }
		}`,
		{
			product: {
				title: [{ locale: 'en-US', value: title }],
				description: [{ locale: 'en-US', value: `${title} description` }],
				details: [{ locale: 'en-US', value: `${title} details` }],
				images: [
					{
						locale: 'en-US',
						url: 'https://example.com/pizza.png',
						width: 300,
						height: 300,
						orientation: 1,
					},
				],
			},
		}
	);

	return data.createProduct;
}

export async function createCarrier(username = `carrier_${unique()}`) {
	const data = await gqlData<{ registerCarrier: { id: string; username: string } }>(
		`mutation Register($registerInput: CarrierRegisterInput!) {
			registerCarrier(registerInput: $registerInput) { id username }
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

	return data.registerCarrier;
}

export async function addProductToWarehouse(
	warehouseId: string,
	productId: string,
	count = 10,
	price = 1200
) {
	const data = await gqlData<{
		addWarehouseProducts: { id: string; count: number; price: number; product: { id: string } }[];
	}>(
		`mutation Add($warehouseId: String!, $products: [WarehouseProductInput!]!) {
			addWarehouseProducts(warehouseId: $warehouseId, products: $products) {
				id count price product { id }
			}
		}`,
		{
			warehouseId,
			products: [
				{
					product: productId,
					price,
					initialPrice: price + 300,
					count,
					isManufacturing: true,
					isCarrierRequired: true,
					isDeliveryRequired: true,
					isProductAvailable: true,
				},
			],
		}
	);

	return data.addWarehouseProducts;
}
