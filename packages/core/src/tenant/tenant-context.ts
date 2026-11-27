import { AsyncLocalStorage } from 'node:async_hooks';
import type { TenantRole } from '@modules/server.common/interfaces/ITenant';

/** Login roles carried in JWTs (AuthService config `role`). */
export type ActorRole = 'admin' | 'warehouse' | 'carrier' | 'user';

/** Who makes the request, from a verified login token. */
export interface TenantActor {
	id: string;
	role: ActorRole;
	/** Role inside the tenant, for admins */
	tenantRole?: TenantRole;
	/** Platform super-admin (may act in any tenant) */
	isSuperAdmin?: boolean;
	/**
	 * The tenant the login belongs to. Differs from the context's tenant only
	 * for a super-admin switched into another tenant: their own account stays
	 * in this one.
	 */
	homeTenantId?: string | null;
}

export interface TenantCtx {
	/** The tenant every tenant-owned query is limited to; null when none was resolved */
	tenantId: string | null;
	actor?: TenantActor;
	/**
	 * Set only by `runAsSystem`: the reason why tenant-owned collections are
	 * read or written across tenants (migrations, logins by global username,
	 * Stripe webhooks). Queries are then not filtered.
	 */
	system?: string;
}

/** A tenant-owned collection was used without a tenant. */
export class TenantContextMissingError extends Error {
	readonly name = 'TenantContextMissingError';

	constructor(what?: string) {
		super(
			`No tenant${what ? ` for ${what}` : ''}: send the Tenant-Id header, ` +
				"use the tenant's host name or log in"
		);
	}
}

const storage = new AsyncLocalStorage<TenantCtx>();

/**
 * Tenant used when nothing set one. Only a single-tenant install
 * (MULTI_TENANT=false) sets it: there, every record belongs to the default
 * tenant anyway. A multi-tenant install leaves it null, so tenant-owned
 * queries without a tenant fail instead of reaching every tenant's data.
 */
let fallbackTenantId: string | null = null;

export const TenantContext = {
	/** Runs `fn` (and everything it starts asynchronously) in `ctx`. */
	run<R>(ctx: TenantCtx, fn: () => R): R {
		return storage.run(ctx, fn);
	},

	/** Runs `fn` in the given tenant, keeping the current actor. */
	runInTenant<R>(tenantId: string, fn: () => R, actor?: TenantActor): R {
		return storage.run(
			{ tenantId, actor: actor ?? storage.getStore()?.actor },
			fn
		);
	},

	/**
	 * Runs `fn` without tenant filtering. Every caller states why; keep these
	 * few and reviewed (grep runAsSystem).
	 */
	runAsSystem<R>(reason: string, fn: () => R): R {
		return storage.run(
			{ tenantId: null, actor: storage.getStore()?.actor, system: reason },
			fn
		);
	},

	current(): TenantCtx | undefined {
		return storage.getStore();
	},

	/** The current tenant, or the fallback one; null when there is none. */
	tenantId(): string | null {
		const ctx = storage.getStore();

		if (ctx?.system) {
			return null;
		}

		return ctx?.tenantId ?? fallbackTenantId;
	},

	/** The current tenant; throws TenantContextMissingError when there is none. */
	requireTenantId(what?: string): string {
		const tenantId = TenantContext.tenantId();

		if (tenantId == null) {
			throw new TenantContextMissingError(what);
		}

		return tenantId;
	},

	actor(): TenantActor | undefined {
		return storage.getStore()?.actor;
	},

	/**
	 * Runs `fn` where the account `id` lives: the actor's own tenant when the
	 * actor reads or edits their own account while switched into another
	 * tenant (super-admins), else the current context.
	 */
	runForOwnAccount<R>(id: string, fn: () => R): R {
		const ctx = storage.getStore();
		const actor = ctx?.actor;

		if (
			actor?.id === id &&
			actor.homeTenantId &&
			!ctx?.system &&
			actor.homeTenantId !== ctx?.tenantId
		) {
			return storage.run({ tenantId: actor.homeTenantId, actor }, fn);
		}

		return fn();
	},

	isSystem(): boolean {
		return !!storage.getStore()?.system;
	},

	/**
	 * The context to run later work in: the current one, or the fallback
	 * tenant. Live streams capture it when they are created, because RxJS
	 * callbacks run in the context of whoever emits, which may be another
	 * tenant's request.
	 */
	capture(): TenantCtx {
		const ctx = storage.getStore();

		if (ctx != null) {
			return ctx;
		}

		return { tenantId: fallbackTenantId };
	},

	setFallbackTenantId(tenantId: string | null) {
		fallbackTenantId = tenantId;
	},

	getFallbackTenantId(): string | null {
		return fallbackTenantId;
	},
};
