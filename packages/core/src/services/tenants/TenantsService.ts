import Logger from 'bunyan';
import { inject, injectable } from 'inversify';
import { DBService } from '@pyro/db-server';
import Tenant from '@modules/server.common/entities/Tenant';
import Admin from '@modules/server.common/entities/Admin';
import type {
	ITenantSettings,
	TenantRole,
	TenantStatus,
} from '@modules/server.common/interfaces/ITenant';
import { getDummyImage } from '@modules/server.common/utils';
import { getModel } from '@pyro/db-server/model';
import { createEverLogger } from '../../helpers/Log';
import { env } from '../../env';
import { AdminsService } from '../admins';
import { TenantContext } from '../../tenant/tenant-context';
import {
	isAvailableSlug,
	isValidSlug,
	tenantDirectory,
} from '../../tenant/tenant-directory';
import { forgetCachedAdmin } from '../../tenant/tenant-resolver';
import { assertMayUseAdminEmail } from '../admins/super-admin';
import { tenantUsage } from '../../tenant/plan-limits';

export interface TenantSignupInput {
	businessName: string;
	slug: string;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

export interface TenantMember {
	id: string;
	name: string;
	email: string;
	role: TenantRole;
	isSuperAdmin: boolean;
}

const MIN_PASSWORD_LENGTH = 8;
/** name@domain.tld; linear time (no two quantifiers that match the same characters in a row) */
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const MAX_EMAIL_LENGTH = 254;
const TENANT_STATUSES: TenantStatus[] = ['active', 'suspended', 'deleted'];

/** Rate limit of tenant signups per client address (in memory, per API instance). */
const signupsByAddress = new Map<string, number[]>();

function checkSignupRate(address: string | undefined) {
	const key = address || 'unknown';
	const now = Date.now();
	const recent = (signupsByAddress.get(key) ?? []).filter(
		(t) => now - t < 3600_000,
	);

	if (recent.length >= env.TENANT_SIGNUPS_PER_HOUR) {
		throw new Error('Too many signups from this address, try again later');
	}

	recent.push(now);
	signupsByAddress.set(key, recent);

	if (signupsByAddress.size > 10_000) {
		for (const [k, times] of signupsByAddress) {
			if (times.every((t) => now - t >= 3600_000)) {
				signupsByAddress.delete(k);
			}
		}
	}
}

/**
 * Tenants: signup, settings, members and the super-admin's list. Not a
 * socket router (no @routerName): only the GraphQL resolver uses it, behind
 * the access table.
 */
@injectable()
export class TenantsService extends DBService<Tenant> {
	public readonly DBObject: any = Tenant;

	protected readonly log: Logger = createEverLogger({
		name: 'tenantsService',
	});

	constructor(
		@inject(AdminsService)
		private readonly adminsService: AdminsService,
	) {
		super();
	}

	async isSlugAvailable(slug: string): Promise<boolean> {
		const normalized = String(slug ?? '')
			.trim()
			.toLowerCase();

		if (!isAvailableSlug(normalized)) {
			return false;
		}

		return (
			(await this.Model.countDocuments({ slug: normalized }).exec()) === 0
		);
	}

	/**
	 * Creates a tenant on the Starter plan with its owner, and logs the
	 * owner in. A paid plan is bought afterwards with Stripe Checkout.
	 */
	async signup(
		input: TenantSignupInput,
		clientAddress?: string,
	): Promise<{ tenant: Tenant; admin: Admin; token: string }> {
		if (!env.TENANT_SIGNUP_ENABLED) {
			throw new Error('Signup is not enabled on this server');
		}

		const name = String(input?.businessName ?? '').trim();
		const slug = String(input?.slug ?? '')
			.trim()
			.toLowerCase();
		const email = String(input?.email ?? '')
			.trim()
			.toLowerCase();
		const password = String(input?.password ?? '');

		if (name.length < 2 || name.length > 80) {
			throw new Error('Enter a business name of 2 to 80 characters');
		}

		if (!isValidSlug(slug)) {
			throw new Error(
				'The address may use a-z, 0-9 and dashes, 3 to 40 characters, starting and ending with a letter or digit',
			);
		}

		if (email.length > MAX_EMAIL_LENGTH || !EMAIL.test(email)) {
			throw new Error('Enter a valid email');
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			throw new Error(
				`The password needs at least ${MIN_PASSWORD_LENGTH} characters`,
			);
		}

		checkSignupRate(clientAddress);

		if (!(await this.isSlugAvailable(slug))) {
			throw new Error(`The address "${slug}" is taken`);
		}

		// a new tenant is never the platform: its owner may not take SUPER_ADMIN_EMAIL
		assertMayUseAdminEmail(email, null);

		const emailTaken = await TenantContext.runAsSystem(
			'admin emails are unique across tenants',
			() => (getModel(Admin) as any).countDocuments({ email }).exec(),
		);

		if (emailTaken > 0) {
			throw new Error(
				'An account with this email exists already: log in instead',
			);
		}

		const tenant = await this.create({
			name,
			slug,
			status: 'active',
			plan: 'starter',
			billing: {},
			settings: {},
			isPlatform: false,
		});

		try {
			const admin = await TenantContext.runInTenant(tenant.id, () =>
				this.adminsService.register(
					{
						admin: {
							email,
							name:
								[input.firstName, input.lastName]
									.filter((s) => s && String(s).trim())
									.join(' ') || name,
							firstName: input.firstName || undefined,
							lastName: input.lastName || undefined,
							hash: null,
							pictureUrl: getDummyImage(
								300,
								300,
								name.charAt(0).toUpperCase(),
							),
						},
						password,
					},
					{ role: 'owner' },
				),
			);

			const updated = await this.update(tenant.id, { ownerId: admin.id });
			tenantDirectory.invalidate(updated);

			const login = await TenantContext.runInTenant(tenant.id, () =>
				this.adminsService.login(email, password),
			);

			if (!login) {
				throw new Error('The new owner could not log in');
			}

			this.log.info({ tenantId: tenant.id, slug }, 'tenant signed up');

			return {
				tenant: updated,
				admin: login.admin as any,
				token: login.token,
			};
		} catch (err) {
			// no half-made tenant: the slug stays free for a retry
			await this.Model.deleteOne({
				_id: tenant.id,
				ownerId: { $exists: false },
			}).exec();
			tenantDirectory.invalidate(tenant);
			throw err;
		}
	}

	/** The tenant of the request. */
	async current(): Promise<Tenant | null> {
		const tenantId = TenantContext.tenantId();
		return tenantId ? this.getCurrent(tenantId) : null;
	}

	async updateCurrent(input: {
		name?: string;
		settings?: Partial<ITenantSettings>;
	}): Promise<Tenant> {
		const tenantId = TenantContext.requireTenantId('tenant settings');
		const tenant = await this.getCurrent(tenantId);

		const update: Record<string, unknown> = {};

		if (input?.name != null) {
			const name = String(input.name).trim();

			if (name.length < 2 || name.length > 80) {
				throw new Error('Enter a business name of 2 to 80 characters');
			}

			update.name = name;
		}

		if (input?.settings) {
			// only these settings are editable by the tenant (domains need verification)
			const { currency, language, logoUrl } = input.settings;
			update.settings = {
				...(tenant.settings ?? {}),
				...(currency !== undefined ? { currency } : {}),
				...(language !== undefined ? { language } : {}),
				...(logoUrl !== undefined ? { logoUrl } : {}),
			};
		}

		const updated = await this.update(tenantId, update as any);
		tenantDirectory.invalidate(updated);

		return updated;
	}

	usage() {
		return tenantUsage();
	}

	async members(): Promise<TenantMember[]> {
		const admins = await this.adminsService.find({
			isDeleted: { $ne: true },
		} as any);

		return admins.map((a) => ({
			id: a.id,
			name: a.name,
			email: a.email,
			role: a.role ?? 'admin',
			isSuperAdmin: a.isSuperAdmin === true,
		}));
	}

	/**
	 * Changes the role of an admin of the current tenant. Only an owner makes
	 * another owner (the previous owner becomes admin); the last owner cannot
	 * step down.
	 */
	async setAdminRole(
		adminId: string,
		role: TenantRole,
	): Promise<TenantMember> {
		if (!['owner', 'admin', 'staff'].includes(role)) {
			throw new Error('Unknown role');
		}

		const tenantId = TenantContext.requireTenantId('member roles');
		const actor = TenantContext.actor();
		const target = await this.adminsService.getCurrent(adminId);

		if (!target || target.isDeleted) {
			throw new Error('No such member');
		}

		const actingAsOwner =
			actor?.tenantRole === 'owner' || actor?.isSuperAdmin === true;

		if ((role === 'owner' || target.role === 'owner') && !actingAsOwner) {
			throw new Error('Only the owner can hand over ownership');
		}

		const tenant = await this.getCurrent(tenantId);

		if (role === 'owner') {
			if (tenant.ownerId && tenant.ownerId !== adminId) {
				await this.adminsService.Model.updateOne(
					{ _id: tenant.ownerId },
					{ $set: { role: 'admin' } },
				).exec();
				forgetCachedAdmin(tenant.ownerId);
			}

			await this.update(tenantId, { ownerId: adminId });
			tenantDirectory.invalidate(tenant);
		} else if (target.role === 'owner') {
			throw new Error('Make another member the owner first');
		}

		await this.adminsService.Model.updateOne(
			{ _id: adminId },
			{ $set: { role } },
		).exec();
		forgetCachedAdmin(adminId);

		const updated = await this.adminsService.getCurrent(adminId);

		return {
			id: updated.id,
			name: updated.name,
			email: updated.email,
			role: updated.role,
			isSuperAdmin: updated.isSuperAdmin === true,
		};
	}

	async removeAdmin(adminId: string): Promise<boolean> {
		const actor = TenantContext.actor();
		const target = await this.adminsService.getCurrent(adminId);

		if (!target || target.isDeleted) {
			return false;
		}

		if (target.role === 'owner') {
			throw new Error(
				'The owner cannot be removed: hand over ownership first',
			);
		}

		if (actor?.id === adminId) {
			throw new Error('You cannot remove yourself');
		}

		if (target.isSuperAdmin && !actor?.isSuperAdmin) {
			throw new Error('Only a super-admin can remove a super-admin');
		}

		await this.adminsService.Model.updateOne(
			{ _id: adminId },
			{ $set: { isDeleted: true } },
		).exec();
		forgetCachedAdmin(adminId);

		return true;
	}

	/** Super-admin: every tenant with its members and stores. */
	async listAll(): Promise<
		Array<{ tenant: Tenant; members: number; stores: number }>
	> {
		const tenants = await this.find({ isDeleted: { $ne: true } } as any);

		return Promise.all(
			tenants.map(async (tenant) => {
				const usage = await TenantContext.runInTenant(tenant.id, () =>
					tenantUsage(),
				);
				return { tenant, members: usage.members, stores: usage.stores };
			}),
		);
	}

	/** Super-admin: suspend (logins and requests refused), reactivate or delete a tenant. */
	async setStatus(tenantId: string, status: TenantStatus): Promise<Tenant> {
		if (!TENANT_STATUSES.includes(status)) {
			throw new Error('Unknown status');
		}

		const tenant = await this.getCurrent(tenantId);

		if (!tenant) {
			throw new Error('No such tenant');
		}

		if (tenant.isPlatform && status !== 'active') {
			throw new Error('The platform tenant stays active');
		}

		const updated = await this.update(tenantId, { status });
		tenantDirectory.invalidate(updated);

		return updated;
	}
}
