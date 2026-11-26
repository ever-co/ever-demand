import {
	socketAuthFrom,
	TENANT_STORAGE_KEY,
} from '@modules/client.common.angular2/lib/tenant';
import { Store } from '../data/store.service';
import {
	ADMIN_SOCKET_AUTH,
	ADMIN_TENANT_CONFIG,
	SWITCHED_TENANT_KEY,
	switchedTenant,
	TOKEN_STORAGE_KEY,
} from './admin-tenant';

describe('admin tenant (Tenant-Id of a super-admin switch only)', () => {
	let store: Store;

	beforeEach(() => {
		localStorage.clear();
		store = new Store();
	});

	afterEach(() => localStorage.clear());

	it('a normal admin names no tenant, even with a slug left in the storage', () => {
		store.token = 'jwt';
		localStorage.setItem(SWITCHED_TENANT_KEY, 'tenant-b');

		expect(switchedTenant()).toBeNull();
		expect(store.switchedTenant).toBeNull();
		expect(ADMIN_TENANT_CONFIG.buildTenant).toBeNull();
	});

	it('a super-admin names the tenant switched into, and nothing on the platform', () => {
		store.isSuperAdmin = true;
		expect(store.switchedTenant).toBeNull();

		store.switchedTenant = 'Tenant-A';
		expect(store.switchedTenant).toBe('tenant-a');
		expect(ADMIN_TENANT_CONFIG.buildTenant).toBe('tenant-a');

		store.switchedTenant = null;
		expect(ADMIN_TENANT_CONFIG.buildTenant).toBeNull();
		expect(localStorage.getItem(SWITCHED_TENANT_KEY)).toBeNull();
	});

	it('the socket handshake sends the login token, and the tenant only after a switch', () => {
		// what app.module.ts passes to CommonModule.forRoot
		expect(ADMIN_SOCKET_AUTH.tokenStorageKey).toBe(TOKEN_STORAGE_KEY);
		const auth = socketAuthFrom(
			ADMIN_SOCKET_AUTH.tenant,
			ADMIN_SOCKET_AUTH.tokenStorageKey,
			ADMIN_SOCKET_AUTH.tenantWithToken,
		);

		expect(auth()).toEqual({});

		store.token = 'jwt';
		expect(auth()).toEqual({ token: 'jwt' });

		store.isSuperAdmin = true;
		store.switchedTenant = 'tenant-a';
		expect(auth()).toEqual({ token: 'jwt', tenant: 'tenant-a' });

		// back to the platform tenant
		store.switchedTenant = null;
		expect(auth()).toEqual({ token: 'jwt' });

		// the admin app never keeps a shop tenant
		expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBeNull();
	});

	it('keeps the session role and flags and forgets them with the session', () => {
		store.adminRole = 'staff';
		store.isSuperAdmin = false;
		store.adminTenantId = 't1';
		expect(store.adminRole).toBe('staff');
		expect(store.isSuperAdmin).toBe(false);
		expect(store.adminTenantId).toBe('t1');

		store.isSuperAdmin = true;
		store.switchedTenant = 'tenant-a';
		store.clear();
		expect(store.adminRole).toBeNull();
		expect(store.isSuperAdmin).toBe(false);
		expect(store.switchedTenant).toBeNull();
	});
});
