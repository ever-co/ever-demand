import type { Env } from '../../env';

/** Password the API gives the first admin it creates on first boot (when no admin exists yet). */
export const DEV_FIRST_ADMIN_PASSWORD = 'admin';

/**
 * - `ADMIN_PASSWORD` when set;
 * - otherwise the well-known "admin" outside production, or in production demo deployments (DEMO=true);
 * - otherwise `null`: production gets no default password, so no admin is created until one is set.
 */
export function firstAdminPassword(
	e: Pick<Env, 'ADMIN_PASSWORD' | 'isProd'>,
	isDemo: boolean
): string | null {
	if (e.ADMIN_PASSWORD) return e.ADMIN_PASSWORD;
	return !e.isProd || isDemo ? DEV_FIRST_ADMIN_PASSWORD : null;
}
