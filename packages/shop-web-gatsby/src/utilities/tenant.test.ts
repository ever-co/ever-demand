import { gql } from '@apollo/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '../apollo/client';
import { config } from '../config';
import {
	resolveClientTenant,
	shopTenant,
	TENANT_HEADER,
	TENANT_STORAGE_KEY,
	tenantFromHost,
	tenantHeaders,
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

afterEach(() => {
	window.history.replaceState({}, '', '/');
	vi.unstubAllGlobals();
});

describe('tenantFromHost', () => {
	it.each([
		['acme.everdemand.co', 'everdemand.co', 'acme'],
		['ACME.EverDemand.co.', '.everdemand.co', 'acme'],
		['my-shop-2.everdemand.co', 'everdemand.co', 'my-shop-2'],
	])('%s on %s is %s', (host, base, tenant) => {
		expect(tenantFromHost(host, base)).toBe(tenant);
	});

	it.each([
		['app', 'app.everdemand.co'],
		['api', 'api.everdemand.co'],
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
			resolveClientTenant({ ...base, buildTenant: ' Brand ' }, location, storage),
		).toBe('brand');
		expect(
			resolveClientTenant(
				{ ...base, buildTenant: TENANT_ID.toUpperCase() },
				location,
				storage,
			),
		).toBe(TENANT_ID);
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

	it('2. the page host wins over the query and the kept tenant', () => {
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

	it('3. a ?tenant= query wins over the kept tenant and is kept', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'kept');

		expect(
			resolveClientTenant(base, page('localhost', '?lang=en&tenant=Acme'), storage),
		).toBe('acme');
		expect(storage.getItem(TENANT_STORAGE_KEY)).toBe('acme');
		// a platform host is no tenant host: the query applies there too
		expect(
			resolveClientTenant(base, page('www.everdemand.co', '?tenant=shop-b'), storage),
		).toBe('shop-b');
	});

	it('an invalid ?tenant= is ignored', () => {
		const storage = new MemoryStorage();

		expect(
			resolveClientTenant(base, page('localhost', '?tenant=-bad-'), storage),
		).toBeNull();
		expect(storage.values.size).toBe(0);
	});

	it('4. the tenant kept from an earlier visit', () => {
		const storage = new MemoryStorage();
		resolveClientTenant(base, page('localhost', '?tenant=acme'), storage);

		expect(resolveClientTenant(base, page('localhost'), storage)).toBe('acme');
	});

	it('a broken kept value is ignored', () => {
		const storage = new MemoryStorage();
		storage.setItem(TENANT_STORAGE_KEY, 'NOT VALID');

		expect(resolveClientTenant(base, page('localhost'), storage)).toBeNull();
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
			resolveClientTenant(base, page('localhost', '?tenant=acme'), storage),
		).toBe('acme');
		expect(resolveClientTenant(base, page('localhost'), storage)).toBeNull();
	});

	it('nothing known: null (the API decides)', () => {
		expect(resolveClientTenant({}, page('localhost'), new MemoryStorage())).toBeNull();
	});

	it('at build time (no window) only the build-time tenant applies', () => {
		expect(resolveClientTenant({ buildTenant: 'brand' }, null, null)).toBe('brand');
		expect(resolveClientTenant(base, null, null)).toBeNull();
	});

	it('in the browser it reads window.location and localStorage', () => {
		window.history.replaceState({}, '', '/products?tenant=acme');

		expect(resolveClientTenant(base)).toBe('acme');
		expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBe('acme');

		window.history.replaceState({}, '', '/orders');

		expect(resolveClientTenant(base)).toBe('acme');
	});
});

describe('GATSBY_TENANT / GATSBY_TENANT_BASE_DOMAIN', () => {
	it('default to empty: no tenant, no header', () => {
		expect(config.tenant).toBe('');
		expect(config.tenantBaseDomain).toBe('');
		expect(shopTenant()).toBeNull();
		expect(tenantHeaders()).toEqual({});
	});

	it('the build-time tenant is used by the shop', () => {
		const previous = config.tenant;
		config.tenant = 'brand';
		try {
			expect(shopTenant()).toBe('brand');
			expect(tenantHeaders()).toEqual({ [TENANT_HEADER]: 'brand' });
		} finally {
			config.tenant = previous;
		}
	});
});

describe('GraphQL requests carry the tenant', () => {
	function fakeFetch() {
		const fetch = vi.fn(
			async (_uri: string, _init: RequestInit) =>
				new Response(JSON.stringify({ data: { ping: 'pong' } }), {
					headers: { 'content-type': 'application/json' },
				}),
		);
		vi.stubGlobal('fetch', fetch);
		return fetch;
	}

	/** The request headers, names lower-cased (Apollo lower-cases them). */
	function headersOf(fetch: ReturnType<typeof fakeFetch>, call = 0) {
		const sent = fetch.mock.calls[call][1].headers as Record<string, string>;
		return Object.fromEntries(
			Object.entries(sent).map(([name, value]) => [name.toLowerCase(), value]),
		);
	}

	const query = gql`
		query Ping {
			ping
		}
	`;

	it('a Tenant-Id header when the shop knows its tenant', async () => {
		const fetch = fakeFetch();
		const client = createClient('http://api.test/graphql', () => 'acme');

		await client.query({ query });

		expect(headersOf(fetch)[TENANT_HEADER.toLowerCase()]).toBe('acme');
	});

	it('no Tenant-Id header without a tenant', async () => {
		const fetch = fakeFetch();
		const client = createClient('http://api.test/graphql', () => null);

		await client.query({ query });

		expect(headersOf(fetch)).not.toHaveProperty(TENANT_HEADER.toLowerCase());
	});

	it('the tenant is read at request time (a ?tenant= link in the browser)', async () => {
		const fetch = fakeFetch();
		const client = createClient('http://api.test/graphql');

		await client.query({ query, fetchPolicy: 'network-only' });
		window.history.replaceState({}, '', '/?tenant=shop-b');
		await client.query({ query, fetchPolicy: 'network-only' });

		expect(headersOf(fetch, 0)).not.toHaveProperty(TENANT_HEADER.toLowerCase());
		expect(headersOf(fetch, 1)[TENANT_HEADER.toLowerCase()]).toBe('shop-b');
	});
});
