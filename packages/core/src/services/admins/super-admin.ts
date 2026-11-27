import bcrypt from 'bcrypt';
import type Logger from 'bunyan';
import Admin from '@modules/server.common/entities/Admin';
import { getModel } from '@pyro/db-server/model';
import { env } from '../../env';
import { TenantContext } from '../../tenant/tenant-context';
import { forgetCachedAccount } from '../../tenant/tenant-resolver';
import { tenantDirectory } from '../../tenant/tenant-directory';
import { DEV_FIRST_ADMIN_PASSWORD } from './firstAdminPassword';

/**
 * Makes the admin of SUPER_ADMIN_EMAIL the only platform super-admin (it
 * may list, switch into and suspend every tenant), at every boot:
 *
 * - every other admin loses the flag (the first admin of a demo install is
 *   no super-admin: its credentials are public);
 * - the configured admin gets it only while its password is not the
 *   default "admin" (changing the password and restarting grants it).
 *
 * Returns whether a super-admin is set.
 */
export async function syncSuperAdmin(
	log: Pick<Logger, 'info' | 'warn' | 'error'>,
	email = env.SUPER_ADMIN_EMAIL,
): Promise<boolean> {
	const wanted = String(email ?? '')
		.trim()
		.toLowerCase();

	const granted = await TenantContext.runAsSystem(
		'the platform super-admin is set by SUPER_ADMIN_EMAIL',
		async () => {
			const admins = getModel(Admin) as any;

			await admins
				.updateMany(
					{
						isSuperAdmin: true,
						...(wanted ? { email: { $ne: wanted } } : {}),
					},
					{ $set: { isSuperAdmin: false } },
				)
				.exec();

			if (!wanted) {
				return false;
			}

			// only an admin of the platform (default) tenant, never one of a tenant
			// that signed up with the email before it was configured
			const admin = await admins
				.findOne({
					email: wanted,
					tenantId: tenantDirectory.getDefaultTenantId(),
					isDeleted: { $ne: true },
				})
				.select('+hash')
				.lean()
				.exec();

			if (!admin) {
				log.warn(
					`SUPER_ADMIN_EMAIL ${wanted}: no such admin yet, so no platform super-admin`,
				);
				return false;
			}

			const usesDefaultPassword =
				typeof admin.hash === 'string' &&
				(await bcrypt.compare(DEV_FIRST_ADMIN_PASSWORD, admin.hash));

			await admins
				.updateOne(
					{ _id: admin._id },
					{ $set: { isSuperAdmin: !usesDefaultPassword } },
				)
				.exec();

			if (usesDefaultPassword) {
				log.error(
					`SUPER_ADMIN_EMAIL ${wanted} still has the default password: not a super-admin until the password is changed (then restart)`,
				);
				return false;
			}

			log.info(`platform super-admin: ${wanted}`);
			return true;
		},
	);

	forgetCachedAccount();

	return granted;
}

/** SUPER_ADMIN_EMAIL, lowercased; '' when none is configured. */
export function superAdminEmail(): string {
	return String(env.SUPER_ADMIN_EMAIL ?? '')
		.trim()
		.toLowerCase();
}

/**
 * Refuses SUPER_ADMIN_EMAIL to an admin of any tenant but the platform
 * (default) one: a tenant signing up (or an admin renaming their login)
 * with it would otherwise become the platform super-admin at the next boot.
 */
export function assertMayUseAdminEmail(
	email: unknown,
	tenantId: string | null,
): void {
	const reserved = superAdminEmail();
	const wanted = String(email ?? '')
		.trim()
		.toLowerCase();

	if (
		reserved &&
		wanted === reserved &&
		tenantId !== tenantDirectory.getDefaultTenantId()
	) {
		throw new Error('This email is reserved: choose another one');
	}
}
