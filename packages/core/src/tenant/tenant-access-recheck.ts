import { env } from '../env';
import type { TenantActor, TenantCtx } from './tenant-context';
import {
	resolveTenantContext,
	TenantRequestInfo,
	TenantResolutionError,
} from './tenant-resolver';

/**
 * Long-lived connections (socket.io, graphql-ws) resolve their tenant and
 * login at connect. An admin removed or demoted since, or a tenant
 * suspended since, must not keep that access: each call re-resolves it
 * (cheap: the tenant and admin lookups are cached, and cleared on change),
 * and a timer re-checks idle connections, so open streams close too.
 */

/** How often an open connection's access is re-checked (ms). */
export function accessRecheckMs(): number {
	return env.TENANT_ACCESS_RECHECK_MS;
}

function actorKey(actor: TenantActor | undefined): string {
	return actor
		? [actor.id, actor.role, actor.tenantRole ?? '', actor.isSuperAdmin ? 'super' : ''].join('|')
		: '';
}

/** Same tenant, same login with the same roles. */
export function sameAccess(a: TenantCtx, b: TenantCtx): boolean {
	return a.tenantId === b.tenantId && actorKey(a.actor) === actorKey(b.actor);
}

/**
 * The connection's context resolved again: the fresh one when the access is
 * unchanged, null when it changed or was revoked (the connection must close
 * and connect again). Other errors (the database is down) are thrown.
 */
export async function recheckAccess(
	info: TenantRequestInfo,
	current: TenantCtx
): Promise<TenantCtx | null> {
	let fresh: TenantCtx;

	try {
		fresh = await resolveTenantContext(info);
	} catch (err) {
		if (err instanceof TenantResolutionError) {
			return null;
		}

		throw err;
	}

	return sameAccess(current, fresh) ? fresh : null;
}
