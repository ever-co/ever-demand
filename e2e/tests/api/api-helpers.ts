/**
 * Helpers of the API project (socket.io "pyro" RPC client and fixtures made
 * through the public API). Endpoints come from ../helpers.ts.
 */
import { randomUUID } from 'node:crypto';
import { io, Socket } from 'socket.io-client';
import { SERVICES_URL } from '../helpers';

/** The NestJS app (REST under /api, GraphQL at /graphql): the origin of GQL_URL. */
export {
	GQL_URL,
	SERVICES_URL,
	SUBSCRIPTIONS_URL,
	ADMIN,
	gql,
	adminToken,
} from '../helpers';
import { adminToken as defaultAdminToken, gql as rawGql } from '../helpers';

export const unique = () => randomUUID().slice(0, 8);

export const SOFIA: [number, number] = [23.3219, 42.6977];

export function geoLocation(coordinates: [number, number] = SOFIA) {
	return {
		countryId: 33,
		city: 'Sofia',
		streetAddress: 'Vitosha Blvd',
		house: '1',
		loc: { type: 'Point', coordinates },
	};
}

/** `gqlData` as the default admin (setup operations are admin-only). */
export const AS_ADMIN = Symbol('the default admin');
/** `gqlData` without a login. */
export const ANONYMOUS = null;

/** Who a `gqlData` call runs as: AS_ADMIN, ANONYMOUS or a login token. */
export type Login = typeof AS_ADMIN | typeof ANONYMOUS | string;

/**
 * gql() that throws on GraphQL errors and returns `data`. Every call says who
 * it runs as (`login`): there is no default login.
 */
export async function gqlData<T = any>(
	query: string,
	variables: Record<string, unknown>,
	login: Login,
): Promise<T> {
	const bearer =
		login === AS_ADMIN ? await defaultAdminToken() : (login ?? undefined);
	const res = await rawGql<T>(query, variables, bearer);
	if (res.errors?.length || res.data == null) {
		throw new Error(`GraphQL failed: ${JSON.stringify(res.errors)}`);
	}
	return res.data;
}

/** socket.io client of the pyro routers: one namespace per router, one event per method. */
export class PyroClient {
	private readonly sockets = new Map<string, Socket>();

	/** `auth`: the handshake auth, e.g. `{ token }` for the merchant / carrier actions. */
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
				socket!.once('connect', () => resolve());
				socket!.once('connect_error', reject);
			});
		}
		return socket;
	}

	/** Calls an @asyncListener method. */
	async call<T = any>(router: string, method: string, ...args: unknown[]): Promise<T> {
		const socket = await this.socket(router);
		return new Promise<T>((resolve, reject) => {
			socket.emit(method, ...args, (err: any, res: T) =>
				err != null ? reject(new Error(err.message ?? JSON.stringify(err))) : resolve(res)
			);
		});
	}

	/** Subscribes to an @observableListener method; next() waits for a matching value. */
	async observe<T = any>(router: string, method: string, ...args: unknown[]) {
		const socket = await this.socket(router);
		const callId = randomUUID();
		const subscriptionId = randomUUID();
		const values: T[] = [];
		const waiters: { match: (v: T) => boolean; resolve: (v: T) => void }[] = [];

		socket.on(`${subscriptionId}_next`, (value: T) => {
			values.push(value);
			for (const w of [...waiters]) {
				if (w.match(value)) {
					waiters.splice(waiters.indexOf(w), 1);
					w.resolve(value);
				}
			}
		});

		socket.emit(method, ...args, callId);
		socket.emit(`${callId}_subscribe`, subscriptionId);

		return {
			next(match: (v: T) => boolean = () => true): Promise<T> {
				const found = values.find(match);
				return found !== undefined
					? Promise.resolve(found)
					: new Promise<T>((resolve) => waiters.push({ match, resolve }));
			},
			unsubscribe() {
				socket.emit(`${subscriptionId}_unsubscribe`);
				socket.off(`${subscriptionId}_next`);
			},
		};
	}

	close() {
		this.sockets.forEach((s) => s.close());
		this.sockets.clear();
	}
}

/** A store with one product in stock, made through GraphQL. */
export async function createStoreWithProduct(count = 10, price = 1200) {
	const id = unique();

	const store = (
		await gqlData(
			`mutation R($i: WarehouseRegisterInput!) { registerWarehouse(registerInput: $i) { id name } }`,
			{
				i: {
					password: 'store-password',
					warehouse: {
						name: `E2E store ${id}`,
						username: `e2e_store_${id}`,
						logo: 'https://example.com/logo.png',
						geoLocation: geoLocation(),
						isActive: true,
						inStoreMode: false,
						carrierCompetition: false,
						isCarrierRequired: true,
						isManufacturing: true,
					},
				},
			},
			AS_ADMIN,
		)
	).registerWarehouse;

	const product = (
		await gqlData(
			`mutation C($p: ProductCreateInput!) { createProduct(product: $p) { id } }`,
			{
				p: {
					title: [{ locale: 'en-US', value: `E2E pizza ${id}` }],
					description: [{ locale: 'en-US', value: 'Margherita' }],
					images: [{ locale: 'en-US', url: 'https://example.com/p.png', width: 300, height: 300, orientation: 1 }],
				},
			}, AS_ADMIN
		)
	).createProduct;

	await gqlData(
		`mutation A($w: String!, $ps: [WarehouseProductInput!]!) { addWarehouseProducts(warehouseId: $w, products: $ps) { id } }`,
		{
			w: store.id,
			ps: [{ product: product.id, price, initialPrice: price + 300, count, isDeliveryRequired: true, isCarrierRequired: true, isManufacturing: true, isProductAvailable: true }],
		}, AS_ADMIN
	);

	// the store's own login, for the merchant actions (socket handshake token)
	const login = await gqlData(
		`mutation L($u: String!) { warehouseLogin(username: $u, password: "store-password") { token } }`,
		{ u: `e2e_store_${id}` },
		ANONYMOUS,
	);

	return {
		storeId: store.id as string,
		productId: product.id as string,
		storeToken: login.warehouseLogin.token as string,
	};
}
