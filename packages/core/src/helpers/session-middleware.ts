import expressSession, { SessionOptions } from 'express-session';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Probe endpoints (see controllers/health). They are hit every few seconds by
 * orchestrators without cookies, so with `saveUninitialized: true` each hit
 * would create a session in the in-memory store that is never freed.
 */
const SESSIONLESS_PATHS = new Set(['/api/health', '/api/health/ready']);

/** Express routing is case-insensitive and ignores a trailing slash by default; mirror that. */
export function isSessionlessPath(path: string | undefined): boolean {
	if (!path) {
		return false;
	}
	const normalized = path.replace(/\/+$/, '').toLowerCase();
	return SESSIONLESS_PATHS.has(normalized);
}

/**
 * Builds the `express-session` middleware, skipping the health probe routes
 * (no session is created and no cookie is set for them). Every other route
 * gets the regular session behaviour.
 */
export function createSessionMiddleware(options: SessionOptions): RequestHandler {
	const session = expressSession(options);

	return (req: Request, res: Response, next: NextFunction) => {
		if (isSessionlessPath(req.path)) {
			return next();
		}
		return session(req, res, next);
	};
}
