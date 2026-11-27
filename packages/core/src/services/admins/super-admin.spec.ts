jest.mock('../../env', () => ({ env: { SUPER_ADMIN_EMAIL: 'Root@Platform.test', MULTI_TENANT: true } }));
jest.mock('../../tenant/tenant-directory', () => ({
	tenantDirectory: { getDefaultTenantId: () => 'platform-tenant' },
}));

import { assertMayUseAdminEmail, superAdminEmail } from './super-admin';

describe('SUPER_ADMIN_EMAIL is reserved to the platform tenant', () => {
	it('is compared without case', () => {
		expect(superAdminEmail()).toBe('root@platform.test');
	});

	it('refuses it to a new tenant and to the admins of other tenants', () => {
		expect(() => assertMayUseAdminEmail('ROOT@platform.test ', null)).toThrow(/reserved/);
		expect(() => assertMayUseAdminEmail('root@platform.test', 'acme')).toThrow(/reserved/);
	});

	it('lets the platform tenant use it, and everyone use other emails', () => {
		expect(() => assertMayUseAdminEmail('root@platform.test', 'platform-tenant')).not.toThrow();
		expect(() => assertMayUseAdminEmail('owner@acme.test', 'acme')).not.toThrow();
		expect(() => assertMayUseAdminEmail(undefined, 'acme')).not.toThrow();
	});
});
