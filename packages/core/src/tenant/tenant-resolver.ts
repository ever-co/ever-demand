import jwt from 'jsonwebtoken';
import Admin from '@modules/server.common/entities/Admin';
import type Tenant from '@modules/server.common/entities/Tenant';
import { getModel } from '@pyro/db-server/model';
import { env } from '../env';
import {
	ActorRole,
	TenantActor,
	TenantContext,
	TenantCtx,
} from './tenant-context';
import { tenantDirectory } from './tenant-directory';

/** What a request (HTTP, GraphQL over WebSocket, socket.io handshake) tells about its tenant. */
export interface TenantRequestInfo {
	/** `Authorization` header or a bare token */
	authorization?: string | null;
	/** `Tenant-Id` header / socket `auth.tenant`: a tenant id or slug */
	tenantHeader?: string | null;
	/** `Host` header */
	host?: string | null;
	/** `Origin` header (a page on `<slug>.everdemand.co` calling api.everdemand.co) */
	origin?: string | null;
}

export class TenantResolutionError extends Error {
	readonly name = 'TenantResolutionError';

	constructor(
		message: string,
		readonly status: 400 | 403 | 404,
		readonly code:
			'TENANT_NOT_FOUND' | 'TENANT_FORBIDDEN' | 'TENANT_SUSPENDED',
	) {
		super(message);
	}
}

const ROLES: ReadonlySet<string> = new Set([
	'admin',
	'warehouse',
	'carrier',
	'user',
]);

export interface VerifiedToken {
	id: string;
	role: ActorRole;
	/** Missing on tokens issued before tenants existed: those belong to the default tenant */
	tenantId?: string;
}

/** Verifies a login token (any role); null when it is missing or invalid. */
export function verifyLoginToken(
	raw: string | null | undefined,
): VerifiedToken | null {
	if (typeof raw !== 'string' || raw.trim() === '') {
		return null;
	}

	const token = raw.trim().replace(/^bearer\s+/i, '');

	try {
		const payload = jwt.verify(token, env.JWT_SECRET, {
			algorithms: ['HS256'],
		}) as any;

		if (
			payload == null ||
			typeof payload !== 'object' ||
			typeof payload.id !== 'string' ||
			payload.id === '' ||
			!ROLES.has(payload.role)
		) {
			return null;
		}

		return {
			id: payload.id,
			role: payload.role,
			tenantId:
				typeof payload.tenantId === 'string' && payload.tenantId !== ''
					? payload.tenantId
					: undefined,
		};
	} catch {
		return null;
	}
}

/** The tenant a verified token belongs to (old tokens: the default tenant). */
export function tokenTenantId(token: VerifiedToken): string | null {
	return token.tenantId ?? tenantDirectory.getDefaultTenantId();
}

const ADMIN_CACHE_TTL_MS = 30_000;
const adminCache = new Map<string, { admin: any; at: number }>();

/** Admin flags that decide what a token may do; read fresh (30 s cache), never from the token. */
async function loadAdmin(id: string): Promise<any | null> {
	const hit = adminCache.get(id);

	if (hit && Date.now() - hit.at < ADMIN_CACHE_TTL_MS) {
		return hit.admin;
	}

	if (!/^[0-9a-f]{24}$/i.test(id)) {
		return null;
	}

	const admin = await TenantContext.runAsSystem(
		'read the admin of a login token',
		() =>
			(getModel(Admin) as any)
				.findById(id)
				.select('tenantId role isSuperAdmin isDeleted')
				.lean()
				.exec(),
	);

	adminCache.set(id, { admin, at: Date.now() });

	return admin;
}

export function forgetCachedAdmin(id?: string) {
	if (id) {
		adminCache.delete(id);
	} else {
		adminCache.clear();
	}
}

/** The actor of a verified token, or null when its admin no longer exists. */
async function actorOf(token: VerifiedToken): Promise<TenantActor | null> {
	const homeTenantId = tokenTenantId(token);

	if (token.role !== 'admin') {
		return { id: token.id, role: token.role, homeTenantId };
	}

	const admin = await loadAdmin(token.id);

	if (!admin || admin.isDeleted) {
		return null;
	}

	return {
		id: token.id,
		role: 'admin',
		tenantRole: admin.role ?? 'admin',
		isSuperAdmin: admin.isSuperAdmin === true,
		homeTenantId,
	};
}

function checkStatus(tenant: Tenant, actor?: TenantActor) {
	if (tenant.status === 'deleted') {
		throw new TenantResolutionError(
			'Tenant not found',
			404,
			'TENANT_NOT_FOUND',
		);
	}

	if (tenant.status === 'suspended' && !actor?.isSuperAdmin) {
		throw new TenantResolutionError(
			'This business is suspended',
			403,
			'TENANT_SUSPENDED',
		);
	}
}

/**
 * The tenant context of a request. Precedence (DESIGN.md §3.3):
 *
 * 1. a valid login token: its tenant (a super-admin may switch with the header);
 * 2. the `Tenant-Id` header / socket `auth.tenant` (id or slug);
 * 3. the sub-domain (or custom domain) of the `Host`, then of the `Origin`;
 * 4. a single-tenant install: the default tenant; otherwise no tenant.
 *
 * Throws TenantResolutionError for an unknown tenant in the header, a
 * logged-in user naming another tenant, and a suspended tenant.
 */
export async function resolveTenantContext(
	info: TenantRequestInfo,
): Promise<TenantCtx> {
	const headerTenant = await headerTenantOf(info);
	const token = verifyLoginToken(info.authorization);
	const actor = token ? await actorOf(token) : null;

	return token && actor
		? loginContext(token, actor, headerTenant)
		: anonymousContext(info, headerTenant);
}

/** The tenant the `Tenant-Id` header / socket `auth.tenant` names; throws when it is unknown. */
async function headerTenantOf(info: TenantRequestInfo): Promise<Tenant | null> {
	const header =
		typeof info.tenantHeader === 'string' ? info.tenantHeader.trim() : '';

	if (!header) {
		return null;
	}

	const tenant = await tenantDirectory.byKey(header);

	if (!tenant) {
		throw new TenantResolutionError(
			`Unknown tenant "${header.slice(0, 64)}"`,
			404,
			'TENANT_NOT_FOUND',
		);
	}

	return tenant;
}

/** A logged-in request: the token's tenant, or the header's for a super-admin. */
async function loginContext(
	token: VerifiedToken,
	actor: TenantActor,
	headerTenant: Tenant | null,
): Promise<TenantCtx> {
	const ownTenantId = tokenTenantId(token);

	if (headerTenant && headerTenant.id !== ownTenantId) {
		if (!actor.isSuperAdmin) {
			throw new TenantResolutionError(
				'This login belongs to another tenant',
				403,
				'TENANT_FORBIDDEN',
			);
		}

		checkStatus(headerTenant, actor);

		return { tenantId: headerTenant.id, actor };
	}

	const own = ownTenantId ? await tenantDirectory.byId(ownTenantId) : null;

	if (!own) {
		throw new TenantResolutionError(
			'The tenant of this login no longer exists',
			403,
			'TENANT_FORBIDDEN',
		);
	}

	checkStatus(own, actor);

	return { tenantId: own.id, actor };
}

/** A request without a (valid) login: the header, then the host, then the default tenant. */
async function anonymousContext(
	info: TenantRequestInfo,
	headerTenant: Tenant | null,
): Promise<TenantCtx> {
	if (headerTenant) {
		checkStatus(headerTenant);
		return { tenantId: headerTenant.id };
	}

	for (const host of [info.host, info.origin]) {
		const tenant = host ? await tenantDirectory.byHost(host) : null;

		if (tenant) {
			checkStatus(tenant);
			return { tenantId: tenant.id };
		}
	}

	return {
		tenantId: env.MULTI_TENANT
			? null
			: tenantDirectory.getDefaultTenantId(),
	};
}

/** First value of a header that may be repeated. */
export function headerValue(
	value: string | string[] | undefined | null,
): string | undefined {
	if (Array.isArray(value)) {
		return value[0];
	}

	return value ?? undefined;
}
