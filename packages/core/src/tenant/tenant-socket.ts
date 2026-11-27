import type { Socket } from 'socket.io';
import { TenantContext, TenantCtx } from './tenant-context';
import { accessRecheckMs, recheckAccess } from './tenant-access-recheck';
import {
	clientAddress,
	headerValue,
	resolveTenantContext,
	TenantResolutionError,
	TenantRequestInfo,
} from './tenant-resolver';

const stringOrUndefined = (value: unknown): string | undefined =>
	typeof value === 'string' && value !== '' ? value : undefined;

/**
 * What a socket.io handshake tells about its tenant: `auth.token` /
 * `auth.tenant` (socket.io-client `io(url, { auth })`), else the
 * `Authorization` / `Tenant-Id` headers or a `?tenant=` query, plus the
 * page's host.
 */
export function socketTenantInfo(
	socket: Pick<Socket, 'handshake'>,
): TenantRequestInfo {
	const {
		auth = {},
		headers = {},
		query = {},
	} = socket.handshake ?? ({} as any);

	return {
		authorization:
			stringOrUndefined((auth as any).token) ??
			headerValue(headers.authorization as any),
		tenantHeader:
			stringOrUndefined((auth as any).tenant) ??
			headerValue(headers['tenant-id'] as any) ??
			stringOrUndefined((query as any).tenant),
		host:
			headerValue(headers['x-forwarded-host'] as any) ??
			headerValue(headers.host as any),
		origin: headerValue(headers.origin as any),
		clientIp: clientAddress(
			(socket.handshake as any)?.address,
			headers['x-forwarded-for'] as any,
		),
	};
}

/**
 * socket.io namespace middleware: resolves the tenant of the connection and
 * keeps it in `socket.data.tenantCtx`, with the handshake (`tenantInfo`) to
 * check it again: before each call and every TENANT_ACCESS_RECHECK_MS, so a
 * removed admin or a suspended tenant is disconnected (`recheckSocketAccess`).
 * A bad tenant refuses the connection (`connect_error` with `data.code`).
 */
export function tenantSocketMiddleware(
	socket: Socket,
	next: (err?: Error) => void,
): void {
	const info = socketTenantInfo(socket);

	resolveTenantContext(info).then(
		(ctx) => {
			socket.data.tenantCtx = ctx;
			socket.data.tenantInfo = info;
			watchSocketAccess(socket);
			next();
		},
		(err) => {
			if (err instanceof TenantResolutionError) {
				const refused: Error & { data?: unknown } = new Error(
					err.message,
				);
				refused.data = { code: err.code, status: err.status };
				next(refused);
			} else {
				next(err);
			}
		},
	);
}

/** Re-checks an idle connection's access, so its open streams close when it is revoked. */
function watchSocketAccess(socket: Socket) {
	if (typeof socket.on !== 'function') {
		return;
	}

	const timer = setInterval(() => {
		recheckSocketAccess(socket).catch(() => undefined);
	}, accessRecheckMs());

	timer.unref?.();
	socket.on('disconnect', () => clearInterval(timer));
}

/** Whether the socket came through tenantSocketMiddleware (its access can be re-checked). */
export function hasSocketTenantInfo(socket: Pick<Socket, 'data'>): boolean {
	return socket.data?.tenantInfo != null;
}

/**
 * The socket's tenant context, checked again (see tenant-access-recheck.ts).
 * Resolves null and disconnects the socket (closing every stream it has
 * open) when its login or tenant no longer gives the same access; it then
 * connects again with what it may do now. Concurrent calls share one check,
 * so they keep their order.
 */
export function recheckSocketAccess(socket: Socket): Promise<TenantCtx | null> {
	const pending: Promise<TenantCtx | null> | undefined =
		socket.data.tenantRecheck;

	if (pending !== undefined) {
		return pending;
	}

	const run = recheckAccess(
		socket.data.tenantInfo,
		socketTenantCtx(socket),
	).then((fresh) => {
		if (fresh) {
			socket.data.tenantCtx = fresh;
			return fresh;
		}

		socket.disconnect(true);
		return null;
	});

	socket.data.tenantRecheck = run;

	const clear = () => {
		if (socket.data.tenantRecheck === run) {
			socket.data.tenantRecheck = undefined;
		}
	};

	run.then(clear, clear);

	return run;
}

/** The tenant context of a connected socket (none when it skipped the middleware). */
export function socketTenantCtx(socket: Pick<Socket, 'data'>): TenantCtx {
	return (
		socket.data?.tenantCtx ?? {
			tenantId: TenantContext.getFallbackTenantId(),
		}
	);
}
