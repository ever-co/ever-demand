import jwt from 'jsonwebtoken';
import Admin from '@modules/server.common/entities/Admin';
import Carrier from '@modules/server.common/entities/Carrier';
import User from '@modules/server.common/entities/User';
import Warehouse from '@modules/server.common/entities/Warehouse';
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
import { clientAddressBy } from './client-address';
import {
	cachedAccount,
	forgetCachedAccount,
	rememberAccount,
} from './account-cache';

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
	/** Address of the client (see clientAddress); kept in the context */
	clientIp?: string | null;
}

/**
 * The client's address, by the TRUST_PROXY rule Express applies to req.ip
 * (tenant/client-address.ts): X-Forwarded-For is read only through trusted
 * proxies, from the right.
 */
export function clientAddress(
	remoteAddress: string | null | undefined,
	forwardedFor: string | string[] | null | undefined,
): string | undefined {
	return clientAddressBy(env.TRUST_PROXY, remoteAddress, forwardedFor);
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

/** The collection of each login role. */
const ACCOUNT_ENTITIES: Record<ActorRole, any> = {
	admin: Admin,
	warehouse: Warehouse,
	carrier: Carrier,
	user: User,
};

/** Fields of an account that decide what its token may do. */
const ACCOUNT_FIELDS: Record<ActorRole, string> = {
	admin: 'tenantId role isSuperAdmin isDeleted',
	warehouse: 'tenantId isDeleted',
	carrier: 'tenantId isDeleted',
	user: 'tenantId isDeleted isBanned',
};

/** Reads an account by id across tenants (a seam for unit tests). */
export const accountLookup = {
	load(role: ActorRole, id: string): Promise<any | null> {
		if (!/^[0-9a-f]{24}$/i.test(id)) {
			return Promise.resolve(null);
		}

		return TenantContext.runAsSystem(
			'read the account of a login token',
			() =>
				(getModel(ACCOUNT_ENTITIES[role]) as any)
					.findById(id)
					.select(ACCOUNT_FIELDS[role])
					.lean()
					.exec(),
		);
	},
};

/**
 * The account of a login token, read fresh (30 s cache), never from the
 * token: a deleted store, carrier or admin and a banned customer lose their
 * access, though tokens never expire.
 */
async function loadAccount(role: ActorRole, id: string): Promise<any | null> {
	const key = `${role}:${id}`;
	const hit = cachedAccount(key);

	if (hit) {
		return hit.account;
	}

	const account = await accountLookup.load(role, id);

	rememberAccount(key, account);

	return account;
}

export { forgetCachedAccount };

/** @deprecated name kept for the member management: same as forgetCachedAccount */
export const forgetCachedAdmin = forgetCachedAccount;

/**
 * The actor of a verified token, or null when its account no longer gives
 * access: deleted (or banned), or in another tenant than the token says.
 */
async function actorOf(token: VerifiedToken): Promise<TenantActor | null> {
	const homeTenantId = tokenTenantId(token);
	const account = await loadAccount(token.role, token.id);

	if (!account || account.isDeleted || account.isBanned === true) {
		return null;
	}

	const accountTenantId = account.tenantId
		? String(account.tenantId)
		: tenantDirectory.getDefaultTenantId();

	if (accountTenantId !== homeTenantId) {
		return null;
	}

	if (token.role !== 'admin') {
		return { id: token.id, role: token.role, homeTenantId };
	}

	return {
		id: token.id,
		role: 'admin',
		tenantRole: account.role ?? 'admin',
		isSuperAdmin: account.isSuperAdmin === true,
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
	const ctx = await resolveTenant(info);

	return info.clientIp ? { ...ctx, clientIp: info.clientIp } : ctx;
}

async function resolveTenant(info: TenantRequestInfo): Promise<TenantCtx> {
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
