const mockEnv = { MULTI_TENANT: true, TENANT_ACCESS_RECHECK_MS: 1000 };

jest.mock('../env', () => ({ env: mockEnv }));

import { TenantContext } from './tenant-context';
import { tenantDirectory } from './tenant-directory';
import {
	assertCardPaymentsAvailable,
	CardPaymentsUnavailableError,
	tenantMayTakeCardPayments,
} from './card-payments';
import { sameAccess } from './tenant-access-recheck';

describe('card payments on the platform Stripe account', () => {
	const fallback = TenantContext.getFallbackTenantId();

	beforeAll(() => {
		tenantDirectory.setDefaultTenantId('platform');
		TenantContext.setFallbackTenantId(null);
	});

	afterAll(() => {
		TenantContext.setFallbackTenantId(fallback);
		mockEnv.MULTI_TENANT = true;
	});

	it('are for the platform tenant only', () => {
		expect(TenantContext.run({ tenantId: 'platform' }, tenantMayTakeCardPayments)).toBe(true);
		expect(TenantContext.run({ tenantId: 'acme' }, tenantMayTakeCardPayments)).toBe(false);
		expect(() => TenantContext.run({ tenantId: 'acme' }, assertCardPaymentsAvailable)).toThrow(
			CardPaymentsUnavailableError
		);
		// no tenant at all: refused too
		expect(tenantMayTakeCardPayments()).toBe(false);
	});

	it('stay open to system work (refunds of charges found) and to single-tenant installs', () => {
		expect(TenantContext.runAsSystem('test', tenantMayTakeCardPayments)).toBe(true);

		mockEnv.MULTI_TENANT = false;
		expect(TenantContext.run({ tenantId: 'acme' }, tenantMayTakeCardPayments)).toBe(true);
		mockEnv.MULTI_TENANT = true;
	});
});

describe('sameAccess (open connections re-check their access)', () => {
	const admin = { id: 'a', role: 'admin' as const, tenantRole: 'admin' as const, homeTenantId: 't' };

	it('holds for the same tenant and the same login with the same roles', () => {
		expect(sameAccess({ tenantId: 't', actor: admin }, { tenantId: 't', actor: { ...admin } })).toBe(true);
		expect(sameAccess({ tenantId: 't' }, { tenantId: 't' })).toBe(true);
	});

	it('fails when the login was removed or demoted, or the tenant changed', () => {
		expect(sameAccess({ tenantId: 't', actor: admin }, { tenantId: 't' })).toBe(false);
		expect(sameAccess({ tenantId: 't', actor: admin }, { tenantId: 't', actor: { ...admin, tenantRole: 'staff' } })).toBe(false);
		expect(sameAccess({ tenantId: 't', actor: { ...admin, isSuperAdmin: true } }, { tenantId: 't', actor: admin })).toBe(false);
		expect(sameAccess({ tenantId: 't', actor: admin }, { tenantId: 'u', actor: admin })).toBe(false);
		expect(sameAccess({ tenantId: 't' }, { tenantId: null })).toBe(false);
	});
});
