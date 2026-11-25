import type { Request } from 'express';

/**
 * Context of every GraphQL operation. Resolvers read the HTTP request from it,
 * e.g. the `Authorization: Bearer <token>` header (see AdminResolver.adminAuthenticated).
 */
export interface GraphQLContext {
	req: Pick<Request, 'headers'>;
}

/** Context for operations sent over HTTP (POST /graphql). */
export function createGraphQLContext({ req }: { req: Request }): GraphQLContext {
	return { req };
}

/**
 * Context for operations sent over the graphql-ws server (see
 * subscriptions/subscriptions.service.ts). A WebSocket has no per-operation
 * headers, so clients pass the token in the `connection_init` payload
 * (`connectionParams` of graphql-ws' `createClient`), as `authorization`
 * (or `Authorization`), either "Bearer <token>" or the bare token. It is exposed
 * to resolvers as the same `req.headers.authorization` header HTTP requests have.
 */
export function createWsGraphQLContext(
	connectionParams: Readonly<Record<string, unknown>> | undefined,
	upgradeHeaders: Record<string, string | string[] | undefined> = {}
): GraphQLContext {
	const raw =
		connectionParams?.authorization ?? connectionParams?.Authorization;

	const headers: Record<string, string | string[] | undefined> = {
		...upgradeHeaders,
	};

	if (typeof raw === 'string' && raw !== '') {
		headers.authorization = /^bearer /i.test(raw) ? raw : `Bearer ${raw}`;
	}

	return { req: { headers } as Pick<Request, 'headers'> };
}
