import jwt from 'jsonwebtoken';
import { env } from '../env';
import { tenantDirectory } from './tenant-directory';
import {
	resolveTenantContext,
	TenantResolutionError,
	verifyLoginToken,
} from './tenant-resolver';

const A = { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', slug: 'acme', status: 'active' } as any;
const B = { id: 'bbbbbbbbbbbbbbbbbbbbbbbb', slug: 'bolt', status: 'active' } as any;
const S = { id: 'cccccccccccccccccccccccc', slug: 'shut', status: 'suspended' } as any;
const DEFAULT_ID = 'dddddddddddddddddddddddd';

const tenants = [A, B, S];

const token = (payload: object) => `Bearer ${jwt.sign(payload, env.JWT_SECRET)}`;

beforeEach(() => {
	jest.spyOn(tenantDirectory, 'byKey').mockImplementation(async (key) =>
		tenants.find((t) => t.id === key || t.slug === key) ?? null
	);
	jest.spyOn(tenantDirectory, 'byId').mockImplementation(async (id) =>
		tenants.find((t) => t.id === id) ?? null
	);
	jest.spyOn(tenantDirectory, 'byHost').mockImplementation(async (host) =>
		tenants.find((t) => String(host).includes(`${t.slug}.everdemand.test`)) ?? null
	);
	jest.spyOn(tenantDirectory, 'getDefaultTenantId').mockReturnValue(DEFAULT_ID);
});

afterEach(() => jest.restoreAllMocks());

describe('verifyLoginToken', () => {
	it('accepts our tokens of known roles, with or without a tenant', () => {
		expect(verifyLoginToken(token({ id: 'w1', role: 'warehouse', tenantId: A.id }))).toEqual({
			id: 'w1',
			role: 'warehouse',
			tenantId: A.id,
		});
		expect(verifyLoginToken(token({ id: 'u1', role: 'user' }))?.tenantId).toBeUndefined();
	});

	it('refuses forged, unknown-role and malformed tokens', () => {
		const forged = `Bearer ${jwt.sign({ id: 'x', role: 'admin' }, 'another-secret')}`;

		expect(verifyLoginToken(forged)).toBeNull();
		expect(verifyLoginToken(token({ id: 'x', role: 'root' }))).toBeNull();
		expect(verifyLoginToken(token({ role: 'admin' }))).toBeNull();
		expect(verifyLoginToken('not-a-jwt')).toBeNull();
		expect(verifyLoginToken('')).toBeNull();
	});
});

describe('resolveTenantContext', () => {
	it('takes the tenant of the login token first', async () => {
		const ctx = await resolveTenantContext({
			authorization: token({ id: 'w1', role: 'warehouse', tenantId: A.id }),
			host: 'bolt.everdemand.test',
		});

		expect(ctx).toEqual({ tenantId: A.id, actor: { id: 'w1', role: 'warehouse', homeTenantId: A.id } });
	});

	it('puts old tokens without a tenant in the default tenant', async () => {
		jest.spyOn(tenantDirectory, 'byId').mockImplementation(async (id) =>
			id === DEFAULT_ID ? ({ id, status: 'active' } as any) : null
		);

		const ctx = await resolveTenantContext({ authorization: token({ id: 'u1', role: 'user' }) });
		expect(ctx.tenantId).toBe(DEFAULT_ID);
	});

	it('refuses a token with the Tenant-Id of another tenant', async () => {
		await expect(
			resolveTenantContext({
				authorization: token({ id: 'w1', role: 'warehouse', tenantId: A.id }),
				tenantHeader: B.slug,
			})
		).rejects.toMatchObject({ status: 403, code: 'TENANT_FORBIDDEN' });
	});

	it('accepts the Tenant-Id of its own tenant', async () => {
		const ctx = await resolveTenantContext({
			authorization: token({ id: 'w1', role: 'warehouse', tenantId: A.id }),
			tenantHeader: A.slug,
		});

		expect(ctx.tenantId).toBe(A.id);
	});

	it('uses the header (id or slug) without a login', async () => {
		expect((await resolveTenantContext({ tenantHeader: B.id })).tenantId).toBe(B.id);
		expect((await resolveTenantContext({ tenantHeader: 'bolt' })).tenantId).toBe(B.id);
	});

	it('answers 404 for an unknown header tenant', async () => {
		await expect(resolveTenantContext({ tenantHeader: 'nobody' })).rejects.toBeInstanceOf(
			TenantResolutionError
		);
	});

	it('uses the Host, then the Origin sub-domain', async () => {
		expect((await resolveTenantContext({ host: 'acme.everdemand.test' })).tenantId).toBe(A.id);
		expect(
			(await resolveTenantContext({ host: 'api.everdemand.test', origin: 'https://bolt.everdemand.test' }))
				.tenantId
		).toBe(B.id);
	});

	it('refuses a suspended tenant', async () => {
		await expect(resolveTenantContext({ tenantHeader: S.slug })).rejects.toMatchObject({
			status: 403,
			code: 'TENANT_SUSPENDED',
		});
	});

	it('ignores an invalid token and falls back to the other sources', async () => {
		const ctx = await resolveTenantContext({ authorization: 'Bearer junk', tenantHeader: A.slug });
		expect(ctx).toEqual({ tenantId: A.id });
	});

	it('resolves no tenant in a multi-tenant install, the default one in a single-tenant install', async () => {
		const ctx = await resolveTenantContext({});
		expect(ctx.tenantId).toBe(env.MULTI_TENANT ? null : DEFAULT_ID);
	});
});
