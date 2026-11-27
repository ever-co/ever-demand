import Admin from '@modules/server.common/entities/Admin';
import User from '@modules/server.common/entities/User';
import { Injectable } from '@angular/core';
import {
	ADMIN_ROLE_KEY,
	ADMIN_TENANT_ID_KEY,
	SUPER_ADMIN_KEY,
	SWITCHED_TENANT_KEY,
	TOKEN_STORAGE_KEY,
	switchedTenant,
} from '../tenant/admin-tenant';

@Injectable()
export class Store {
	get token(): string | null {
		return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
	}

	set token(token: string) {
		if (token == null) {
			localStorage.removeItem(TOKEN_STORAGE_KEY);
		} else {
			localStorage.setItem(TOKEN_STORAGE_KEY, token);
		}
	}

	get adminId(): Admin['id'] | null {
		return localStorage.getItem('_adminId') || null;
	}

	set adminId(id: Admin['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_adminId');
		} else {
			localStorage.setItem('_adminId', id);
		}
	}

	/** Role of the logged-in admin in its tenant: owner, admin or staff */
	get adminRole(): string | null {
		return localStorage.getItem(ADMIN_ROLE_KEY) || null;
	}

	set adminRole(role: string | null) {
		this.setOrRemove(ADMIN_ROLE_KEY, role);
	}

	/** The logged-in admin is a platform super-admin (may switch tenant) */
	get isSuperAdmin(): boolean {
		return localStorage.getItem(SUPER_ADMIN_KEY) === 'true';
	}

	set isSuperAdmin(value: boolean) {
		this.setOrRemove(SUPER_ADMIN_KEY, value ? 'true' : null);
	}

	/** Tenant of the logged-in admin (from its login) */
	get adminTenantId(): string | null {
		return localStorage.getItem(ADMIN_TENANT_ID_KEY) || null;
	}

	set adminTenantId(id: string | null) {
		this.setOrRemove(ADMIN_TENANT_ID_KEY, id);
	}

	/**
	 * Slug of the tenant a super-admin switched into (sent as `Tenant-Id`);
	 * always null for other admins.
	 */
	get switchedTenant(): string | null {
		return switchedTenant(localStorage);
	}

	set switchedTenant(slug: string | null) {
		this.setOrRemove(SWITCHED_TENANT_KEY, slug);
	}

	private setOrRemove(key: string, value: string | null | undefined) {
		if (value == null || value === '') {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, value);
		}
	}

	get userId(): User['id'] | null {
		return localStorage.getItem('_userId') || null;
	}

	set userId(id: User['id'] | null) {
		if (id == null) {
			localStorage.removeItem('_userId');
		} else {
			localStorage.setItem('_userId', id);
		}
	}

	get maintenanceMode(): string | null {
		return localStorage.getItem('maintenanceMode') || null;
	}

	get serverConnection() {
		return localStorage.getItem('serverConnection');
	}

	set serverConnection(val: string) {
		localStorage.setItem('serverConnection', val);
	}

	get adminPasswordReset() {
		return localStorage.getItem('adminPasswordReset');
	}

	set adminPasswordReset(val: string) {
		localStorage.setItem('adminPasswordReset', val);
	}

	get fakeDataGenerator() {
		return localStorage.getItem('fakeDataGenerator');
	}

	set fakeDataGenerator(val: string) {
		localStorage.setItem('fakeDataGenerator', val);
	}

	clearMaintenanceMode() {
		localStorage.removeItem('maintenanceMode');
	}

	clear() {
		localStorage.clear();
	}
}
