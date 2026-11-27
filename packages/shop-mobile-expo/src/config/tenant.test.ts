import { ApolloClient, gql } from '@apollo/client';
import { createApolloClient, wsConnectionParams } from '../graphql/client';
import { socketOptions } from '../rpc/client';
import { shopTenant } from '../services/container';
import { loadEnvironment } from './env';
import {
	resolveClientTenant,
	socketAuth,
	TENANT_HEADER,
	TENANT_STORAGE_KEY,
	tenantFromHost,
	tenantToSend,
	tokenTenantId,
	webLocation,
	webStorage,
	type StorageLike,
} from './tenant';

const TENANT_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';

class MemoryStorage implements StorageLike {
	readonly values = new Map<string, string>();
	getItem(key: string) {
		return this.values.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.values.set(key, value);
	}
}

const page = (hostname: string, search = '') => ({ hostname, search });

/** An unsigned JWT with these claims (the client only reads them). */
function jwt(claims: object): string {
	const part = (value: object) =>
		Buffer.from(JSON.stringify(value)).toString('base64url');
	return `${part({ alg: 'HS256', typ: 'JWT' })}.${part(claims)}.signature`;
}

describe('tenantFromHost', () => {
	it.each([
		['acme.everdemand.co', 'everdemand.co', 'acme'],
		['ACME.EverDemand.co.', '.everdemand.co', 'acme'],
		['my-shop-2.everdemand.co', 'everdemand.co', 'my-shop-2'],
	])('%s on %s is %s', (host, base, tenant) => {
		expect(tenantFromHost(host, base)).toBe(tenant);
	});

	it.each([
		['the platform hosts', 'app.everdemand.co'],
		['the API host', 'api.everdemand.co'],
		['www', 'www.everdemand.co'],
		['admin', 'admin.everdemand.co'],
		['the base domain itself', 'everdemand.co'],
		['two labels', 'a.b.everdemand.co'],
		['another domain', 'acme.example.com'],
		['a look-alike domain', 'acme.noteverdemand.co'],
		['a one-letter label', 'a.everdemand.co'],
		['a label ending in a dash', 'acme-.everdemand.co'],
		['a label of 41 characters', `${'a'.repeat(41)}.everdemand.co`],
	])('ignores %s', (_name, host) => {
		expect(tenantFromHost(host, 'everdemand.co')).toBeNull();
	});

	it('needs a base domain', () => {
		expect(tenantFromHost('acme.everdemand.co', '')).toBeNull();
		expect(tenantFromHost('acme.everdemand.co', null)).toBeNull();
	});
});

describe('resolveClientTenant: build-time, then host, then ?tenant=, then the kept tenant', () => {
	const base = { baseDomain: 'everdemand.co' };

	it('1. a white-label build-time slug or id wins over everything', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'kept');
		const location = page('acme.everdemand.co', '?tenant=other');

		expect(
			resolveClientTenant(
				{ ...base, buildTenant: ' Brand ' },
				location,
				storage,
			),
		).toBe('brand');
		expect(
			resolveClientTenant(
				{ ...base, buildTenant: TENANT_ID.toUpperCase() },
				location,
				storage,
			),
		).toBe(TENANT_ID);
		// the build-time tenant is never written over the kept one
		expect(storage.getItem(TENANT_STORAGE_KEY)).toBe('kept');
	});

	it('an invalid build-time value is ignored', () => {
		expect(
			resolveClientTenant(
				{ ...base, buildTenant: 'Not a slug!' },
				page('acme.everdemand.co'),
				null,
			),
		).toBe('acme');
	});

	it('2. the <slug> of a <slug>.<base domain> page host wins over the query and the kept tenant', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'kept');

		expect(
			resolveClientTenant(
				base,
				page('acme.everdemand.co', '?tenant=other'),
				storage,
			),
		).toBe('acme');
		expect(storage.getItem(TENANT_STORAGE_KEY)).toBe('kept');
	});

	it('3. a ?tenant= query wins over the kept tenant and is kept for later visits', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'kept');

		expect(
			resolveClientTenant(
				base,
				page('localhost', '?lang=en&tenant=Acme'),
				storage,
			),
		).toBe('acme');
		expect(storage.getItem(TENANT_STORAGE_KEY)).toBe('acme');
		// a platform host is no tenant host: the query applies there too
		expect(
			resolveClientTenant(
				base,
				page('app.everdemand.co', '?tenant=shop-b'),
				storage,
			),
		).toBe('shop-b');
	});

	it('an invalid ?tenant= is ignored', () => {
		const storage = new MemoryStorage();

		expect(
			resolveClientTenant(
				base,
				page('localhost', '?tenant=-bad-'),
				storage,
			),
		).toBeNull();
		expect(storage.values.size).toBe(0);
	});

	it('4. the tenant kept from an earlier visit', () => {
		const storage = new MemoryStorage();
		resolveClientTenant(base, page('localhost', '?tenant=acme'), storage);

		expect(resolveClientTenant(base, page('localhost', ''), storage)).toBe(
			'acme',
		);
	});

	it('a broken kept value is ignored', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'NOT VALID');

		expect(
			resolveClientTenant(base, page('localhost'), storage),
		).toBeNull();
	});

	it('a storage that throws does not break the resolution', () => {
		const storage: StorageLike = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			},
		};

		expect(
			resolveClientTenant(
				base,
				page('localhost', '?tenant=acme'),
				storage,
			),
		).toBe('acme');
		expect(
			resolveClientTenant(base, page('localhost'), storage),
		).toBeNull();
	});

	it('nothing known: null (the API decides)', () => {
		expect(
			resolveClientTenant({}, page('localhost'), new MemoryStorage()),
		).toBeNull();
	});

	it('native (no page location, no localStorage): only the build-time tenant applies', () => {
		expect(webLocation()).toBeNull();
		expect(
			resolveClientTenant({
				buildTenant: 'brand',
				baseDomain: 'everdemand.co',
			}),
		).toBe('brand');
		expect(resolveClientTenant({ baseDomain: 'everdemand.co' })).toBeNull();
	});

	it('web build: reads the page location and localStorage by default', () => {
		const storage = new MemoryStorage();
		const g = globalThis as { location?: unknown; localStorage?: unknown };
		g.location = { hostname: 'localhost', search: '?tenant=acme' };
		g.localStorage = storage;
		try {
			expect(webLocation()).toEqual(page('localhost', '?tenant=acme'));
			expect(webStorage()).toBe(storage);
			expect(resolveClientTenant({ baseDomain: 'everdemand.co' })).toBe(
				'acme',
			);
			expect(storage.getItem(TENANT_STORAGE_KEY)).toBe('acme');
		} finally {
			delete g.location;
			delete g.localStorage;
		}
	});
});

describe('login tokens: never a Tenant-Id other than the token tenant', () => {
	it('reads the tenantId claim of a token', () => {
		expect(
			tokenTenantId(jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID })),
		).toBe(TENANT_ID);
		expect(
			tokenTenantId(
				`Bearer ${jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID })}`,
			),
		).toBe(TENANT_ID);
		expect(tokenTenantId(jwt({ id: 'u1', role: 'user' }))).toBeNull();
		expect(tokenTenantId('opaque')).toBeNull();
		expect(tokenTenantId(null)).toBeNull();
	});

	it('sends the resolved tenant without a token, the token tenant (or none) with one', () => {
		expect(tenantToSend('acme', null)).toBe('acme');
		expect(
			tenantToSend(
				'acme',
				jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID }),
			),
		).toBe(TENANT_ID);
		expect(
			tenantToSend('acme', jwt({ id: 'u1', role: 'user' })),
		).toBeNull();
	});

	it('builds the socket handshake auth', () => {
		const token = jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID });

		expect(socketAuth('acme')).toEqual({ tenant: 'acme' });
		expect(socketAuth(null)).toEqual({});
		expect(socketAuth('acme', token)).toEqual({ tenant: TENANT_ID, token });
	});
});

describe('the tenant reaches the API', () => {
	it('socket.io: the handshake auth callback reads the tenant again at every (re)connect', () => {
		let tenant = 'acme';
		const options = socketOptions(() => socketAuth(tenant));
		const cb = jest.fn();

		options.auth(cb);
		tenant = 'shop-b';
		options.auth(cb);

		expect(options).toMatchObject({
			reconnection: false,
			transports: ['websocket'],
		});
		expect(cb.mock.calls).toEqual([
			[{ tenant: 'acme' }],
			[{ tenant: 'shop-b' }],
		]);
	});

	it('graphql-ws: connectionParams carry the tenant, next to authorization with a token', () => {
		const token = jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID });

		expect(wsConnectionParams(null, 'acme')).toEqual({ tenant: 'acme' });
		expect(wsConnectionParams(null, null)).toEqual({});
		expect(wsConnectionParams(token, 'acme')).toEqual({
			authorization: `Bearer ${token}`,
			tenant: TENANT_ID,
		});
	});

	async function headersOf(
		tenant: string | null,
		token: string | null = null,
	) {
		const fetch = jest.fn(async (_uri: string, _init: RequestInit) => ({
			status: 200,
			headers: { get: () => 'application/json' },
			text: async () => JSON.stringify({ data: { ping: 'pong' } }),
		}));
		const client: ApolloClient = createApolloClient({
			httpEndpoint: 'http://api.test/graphql',
			subscriptionsEndpoint: 'ws://api.test/subscriptions',
			getTenant: () => tenant,
			getToken: () => token,
			fetch: fetch as unknown as typeof globalThis.fetch,
		});
		await client.query({
			query: gql`
				query Ping {
					ping
				}
			`,
		});
		client.stop();
		// Apollo lower-cases header names (HTTP header names are case-insensitive)
		const sent = fetch.mock.calls[0][1].headers as Record<string, string>;
		return Object.fromEntries(
			Object.entries(sent).map(([name, value]) => [
				name.toLowerCase(),
				value,
			]),
		);
	}

	const tenantHeader = TENANT_HEADER.toLowerCase();

	it('GraphQL over HTTP: a Tenant-Id header when the shop knows its tenant', async () => {
		expect((await headersOf('acme'))[tenantHeader]).toBe('acme');
		expect(await headersOf(null)).not.toHaveProperty(tenantHeader);
	});

	it('GraphQL over HTTP with a token: the token tenant, never another', async () => {
		const token = jwt({ id: 'u1', role: 'user', tenantId: TENANT_ID });
		const headers = await headersOf('acme', token);

		expect(headers[tenantHeader]).toBe(TENANT_ID);
		expect(headers.authorization).toBe(`Bearer ${token}`);
	});

	it('EXPO_PUBLIC_TENANT / EXPO_PUBLIC_TENANT_BASE_DOMAIN: default empty, used by the services', () => {
		const environment = loadEnvironment();

		expect(environment.TENANT).toBe('');
		expect(environment.TENANT_BASE_DOMAIN).toBe('');
		expect(shopTenant(environment)).toBeNull();
		expect(shopTenant({ ...environment, TENANT: 'brand' })).toBe('brand');
	});
});
