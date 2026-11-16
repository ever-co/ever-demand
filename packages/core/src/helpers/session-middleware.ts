import expressSession, { SessionOptions } from 'express-session';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Probe endpoints (see controllers/health). They are hit every few seconds by
 * orchestrators without cookies, so with `saveUninitialized: true` each hit
 * would create a session in the in-memory store that is never freed.
 */
const SESSIONLESS_PATHS = new Set(['/api/health', '/api/health/ready']);

/** Longest path that can match: the longest entry plus one trailing slash. */
const MAX_SESSIONLESS_PATH_LENGTH =
	Math.max(...Array.from(SESSIONLESS_PATHS, (p) => p.length)) + 1;

/**
 * Express routing (default settings) is case-insensitive and accepts one
 * optional trailing slash; mirror that. This runs on every request, so it
 * must stay O(1): no regex over the whole path (a trailing-slash regex such as
 * `/\/+$/` is quadratic on a long run of slashes and blocks the event loop).
 */
export function isSessionlessPath(path: string | undefined): boolean {
	if (!path || path.length > MAX_SESSIONLESS_PATH_LENGTH) {
		return false;
	}
	const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
	return SESSIONLESS_PATHS.has(trimmed.toLowerCase());
}

/**
 * Builds the `express-session` middleware, skipping the health probe routes
 * (no session is created and no cookie is set for them). Every other route
 * gets the regular session behaviour.
 */
export function createSessionMiddleware(
	options: SessionOptions
): RequestHandler {
	const session = expressSession(options);

	return (req: Request, res: Response, next: NextFunction) => {
		if (isSessionlessPath(req.path)) {
			return next();
		}
		return session(req, res, next);
	};
}
