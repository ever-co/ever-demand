import type { Socket } from 'socket.io';
import { TenantContext, TenantCtx } from './tenant-context';
import {
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
export function socketTenantInfo(socket: Pick<Socket, 'handshake'>): TenantRequestInfo {
	const { auth = {}, headers = {}, query = {} } = socket.handshake ?? ({} as any);

	return {
		authorization:
			stringOrUndefined((auth as any).token) ??
			headerValue(headers.authorization as any),
		tenantHeader:
			stringOrUndefined((auth as any).tenant) ??
			headerValue(headers['tenant-id'] as any) ??
			stringOrUndefined((query as any).tenant),
		host: headerValue(headers['x-forwarded-host'] as any) ?? headerValue(headers.host as any),
		origin: headerValue(headers.origin as any),
	};
}

/**
 * socket.io namespace middleware: resolves the tenant once per connection
 * and keeps it in `socket.data.tenantCtx`. A bad tenant refuses the
 * connection (`connect_error` with `data.code`).
 */
export function tenantSocketMiddleware(
	socket: Socket,
	next: (err?: Error) => void
): void {
	resolveTenantContext(socketTenantInfo(socket)).then(
		(ctx) => {
			socket.data.tenantCtx = ctx;
			next();
		},
		(err) => {
			if (err instanceof TenantResolutionError) {
				const refused: Error & { data?: unknown } = new Error(err.message);
				refused.data = { code: err.code, status: err.status };
				next(refused);
			} else {
				next(err);
			}
		}
	);
}

/** The tenant context of a connected socket (none when it skipped the middleware). */
export function socketTenantCtx(socket: Pick<Socket, 'data'>): TenantCtx {
	return socket.data?.tenantCtx ?? { tenantId: TenantContext.getFallbackTenantId() };
}
