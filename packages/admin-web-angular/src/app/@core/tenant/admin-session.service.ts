import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoutersService } from '@modules/client.common.angular2/lib/router/routers.service';
import { Store } from '../data/store.service';
import type { SessionAdmin } from '../data/tenants.service';
import { GraphQLWsClientRef } from '../../graphql/graphql.providers';
import { ServerSettingsService } from '../services/server-settings.service';
import { tenantPermissions, type TenantPermissions } from './tenant-rules';

/**
 * The logged-in admin's session: what a login (or a tenant signup) keeps, and
 * the super-admin's tenant switch. Sockets name their tenant and token once,
 * when they connect, so every change reconnects them (RoutersService and
 * graphql-ws).
 */
@Injectable({ providedIn: 'root' })
export class AdminSessionService {
	constructor(
		private readonly store: Store,
		private readonly router: Router,
		private readonly routers: RoutersService,
		private readonly ws: GraphQLWsClientRef,
		private readonly serverSettings: ServerSettingsService,
	) {}

	/** Keeps the token and the admin of a login or a signup, then reconnects. */
	start(token: string, admin: SessionAdmin) {
		this.store.token = token;
		this.store.adminId = admin.id;
		this.store.adminRole = admin.role ?? null;
		this.store.isSuperAdmin = admin.isSuperAdmin === true;
		this.store.adminTenantId = admin.tenantId ?? null;
		// a new login always starts in its own tenant
		this.store.switchedTenant = null;

		this.reconnect();
		// the admin app settings are for logged-in admins only
		void this.serverSettings.load();
	}

	/** After a logout (the Store is cleared by the caller). */
	ended() {
		this.reconnect();
	}

	/** Updates the role kept for the screens (the API checks it on every call). */
	refresh(admin: Pick<SessionAdmin, 'role' | 'isSuperAdmin'> | null | undefined) {
		if (!admin) {
			return;
		}

		if (admin.role !== undefined) {
			this.store.adminRole = admin.role ?? null;
		}

		if (admin.isSuperAdmin !== undefined && admin.isSuperAdmin !== null) {
			const wasSuperAdmin = this.store.isSuperAdmin;
			this.store.isSuperAdmin = admin.isSuperAdmin === true;

			if (wasSuperAdmin && !this.store.isSuperAdmin) {
				this.store.switchedTenant = null;
			}
		}
	}

	get isSuperAdmin(): boolean {
		return this.store.isSuperAdmin;
	}

	get role(): string | null {
		return this.store.adminRole;
	}

	/** The tenant a super-admin acts in ('' / null = the platform tenant). */
	get switchedTenant(): string | null {
		return this.store.switchedTenant;
	}

	/**
	 * What the admin may do in the tenant on screen. While a super-admin acts in
	 * another tenant, they count as its owner (as the API does).
	 */
	permissions(): TenantPermissions {
		return tenantPermissions(this.store.adminRole, this.store.isSuperAdmin);
	}

	/**
	 * Super-admin: act in the tenant `slug` (null = back to the platform
	 * tenant). Every later request and socket names it, and the screens load
	 * again (sign-in-redirect: the dashboard, or the setup without a store).
	 *
	 * The Apollo cache is not cleared: every read of the admin app is
	 * `network-only` (graphql.providers.ts DEFAULT_OPTIONS), and clearing it
	 * would reject the queries in flight (the header's poll) with an error.
	 */
	async switchTenant(slug: string | null): Promise<void> {
		if (!this.store.isSuperAdmin) {
			throw new Error('Only a platform super-admin can switch tenant');
		}

		this.store.switchedTenant = slug ? slug.trim().toLowerCase() : null;

		this.reconnect();
		await this.router.navigateByUrl('/sign-in-redirect');
	}

	private reconnect() {
		this.routers.reconnectAll();
		this.ws.restart();
	}
}
