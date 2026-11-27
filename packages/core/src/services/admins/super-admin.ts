import bcrypt from 'bcrypt';
import type Logger from 'bunyan';
import Admin from '@modules/server.common/entities/Admin';
import { getModel } from '@pyro/db-server/model';
import { env } from '../../env';
import { TenantContext } from '../../tenant/tenant-context';
import { forgetCachedAccount } from '../../tenant/tenant-resolver';
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
	const wanted = String(email ?? '').trim().toLowerCase();

	const granted = await TenantContext.runAsSystem(
		'the platform super-admin is set by SUPER_ADMIN_EMAIL',
		async () => {
			const admins = getModel(Admin) as any;

			await admins
				.updateMany(
					{ isSuperAdmin: true, ...(wanted ? { email: { $ne: wanted } } : {}) },
					{ $set: { isSuperAdmin: false } },
				)
				.exec();

			if (!wanted) {
				return false;
			}

			const admin = await admins.findOne({ email: wanted }).select('+hash').lean().exec();

			if (!admin) {
				log.warn(`SUPER_ADMIN_EMAIL ${wanted}: no such admin yet, so no platform super-admin`);
				return false;
			}

			const usesDefaultPassword =
				typeof admin.hash === 'string' &&
				(await bcrypt.compare(DEV_FIRST_ADMIN_PASSWORD, admin.hash));

			await admins
				.updateOne({ _id: admin._id }, { $set: { isSuperAdmin: !usesDefaultPassword } })
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
