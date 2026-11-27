import type { NextFunction, Request, Response } from 'express';
import { TenantContext } from './tenant-context';
import {
	clientAddress,
	headerValue,
	resolveTenantContext,
	TenantResolutionError,
	TenantRequestInfo,
} from './tenant-resolver';

export const TENANT_HEADER = 'tenant-id';

export function requestTenantInfo(
	req: Pick<Request, 'headers'> & Partial<Pick<Request, 'ip' | 'socket'>>,
): TenantRequestInfo {
	return {
		// Express applies TRUST_PROXY to req.ip (nest-bootstrap.ts)
		clientIp:
			req.ip ??
			clientAddress(
				req.socket?.remoteAddress,
				req.headers['x-forwarded-for'],
			),
		authorization: headerValue(req.headers.authorization),
		tenantHeader: headerValue(req.headers[TENANT_HEADER]),
		host:
			headerValue(req.headers['x-forwarded-host']) ??
			headerValue(req.headers.host),
		origin: headerValue(req.headers.origin),
	};
}

/**
 * Express middleware: resolves the tenant of the request and runs the rest
 * of the request (GraphQL, REST, express routes) in its TenantContext. Mount
 * it after the body parsers: their callbacks would lose the context.
 */
export function tenantHttpMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	resolveTenantContext(requestTenantInfo(req)).then(
		(ctx) => {
			(req as any).tenantCtx = ctx;
			TenantContext.run(ctx, () => next());
		},
		(err) => {
			if (err instanceof TenantResolutionError) {
				res.status(err.status).json({
					statusCode: err.status,
					code: err.code,
					message: err.message,
				});
			} else {
				next(err);
			}
		},
	);
}
