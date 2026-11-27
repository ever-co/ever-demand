import http from 'http';
import {
	Inject,
	Injectable,
	OnApplicationBootstrap,
	OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { execute, subscribe, type GraphQLSchema } from 'graphql';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { createWsGraphQLContext } from '../graphql-context';
import { TenantContext, TenantCtx } from '../../tenant/tenant-context';
import {
	clientAddress,
	headerValue,
	resolveTenantContext,
} from '../../tenant/tenant-resolver';
import {
	accessRecheckMs,
	recheckAccess,
} from '../../tenant/tenant-access-recheck';
import { SUBSCRIPTIONS_PATH, SUBSCRIPTIONS_PORT } from './subscription.constants';
import { createEverLogger } from '../../helpers/Log';

export interface SubscriptionsServer {
	readonly port: number;
	close(): Promise<void>;
}

/**
 * Starts a graphql-ws server for `schema` on `port` (all interfaces), path
 * /subscriptions. Resolves once it listens.
 */
export async function startSubscriptionsServer(
	schema: GraphQLSchema,
	port: number
): Promise<SubscriptionsServer> {
	const httpServer = http.createServer((req, res) => {
		// only WebSocket upgrades are served here
		res.writeHead(426, { 'content-type': 'text/plain' });
		res.end('Upgrade Required: use the graphql-ws protocol');
	});

	const wsServer = new WebSocketServer({
		server: httpServer,
		path: SUBSCRIPTIONS_PATH,
	});

	/**
	 * The connection's tenant context checked again (tenant-access-recheck.ts):
	 * a connection whose login or tenant lost its access is closed (4403),
	 * which ends its subscriptions; the client connects again.
	 */
	const currentAccess = async (extra: any): Promise<TenantCtx> => {
		let fresh: TenantCtx | null;

		try {
			fresh = await recheckAccess(extra.tenantInfo, extra.tenantCtx);
		} catch {
			// the check itself failed (e.g. the database is down): keep the
			// connection's access; the next check applies any change
			return extra.tenantCtx;
		}

		if (!fresh) {
			extra.socket.close(4403, 'Forbidden: access changed');
			throw new Error('Access changed: connect again');
		}

		extra.tenantCtx = fresh;

		return fresh;
	};

	/** Re-checks idle connections too, so open subscriptions end when access is revoked. */
	const watchAccess = (extra: any) => {
		const timer = setInterval(() => {
			currentAccess(extra).catch(() => undefined);
		}, accessRecheckMs());

		timer.unref?.();
		extra.socket.once('close', () => clearInterval(timer));
	};

	const tenantOf = (contextValue: any): TenantCtx =>
		contextValue?.tenantCtx ?? {
			tenantId: TenantContext.getFallbackTenantId(),
		};

	const serverCleanup = useServer(
		{
			schema,
			// one tenant per WebSocket, resolved like an HTTP request
			// (connectionParams `authorization` / `tenant`, then headers, host)
			onConnect: async (ctx) => {
				const params: Record<string, unknown> = ctx.connectionParams ?? {};
				const headers = ctx.extra.request.headers;
				const str = (v: unknown) =>
					typeof v === 'string' && v !== '' ? v : undefined;

				const info = {
					authorization:
						str(params.authorization) ??
						str(params.Authorization) ??
						headerValue(headers.authorization),
					tenantHeader:
						str(params.tenant) ??
						str(params['Tenant-Id']) ??
						headerValue(headers['tenant-id'] as any),
					host: headerValue(headers.host),
					origin: headerValue(headers.origin),
					clientIp: clientAddress(
						ctx.extra.request.socket?.remoteAddress,
						headers['x-forwarded-for'],
					),
				};

				try {
					(ctx.extra as any).tenantCtx = await resolveTenantContext(info);
				} catch {
					return false;
				}

				(ctx.extra as any).tenantInfo = info;
				watchAccess(ctx.extra);

				return true;
			},
			// each operation runs with the access the login and tenant give now
			context: async (ctx) => ({
				...createWsGraphQLContext(
					ctx.connectionParams,
					ctx.extra.request.headers
				),
				tenantCtx: await currentAccess(ctx.extra),
			}),
			execute: (args) =>
				TenantContext.run(tenantOf(args.contextValue), () => execute(args)),
			subscribe: (args) =>
				TenantContext.run(tenantOf(args.contextValue), () =>
					subscribe(args)
				),
		},
		wsServer
	);

	await new Promise<void>((resolve, reject) => {
		httpServer.once('error', reject);
		httpServer.listen(port, () => {
			httpServer.off('error', reject);
			resolve();
		});
	});

	const address = httpServer.address();

	return {
		port: typeof address === 'object' && address ? address.port : port,
		async close() {
			await serverCleanup.dispose();
			await new Promise<void>((resolve) => wsServer.close(() => resolve()));
			await new Promise<void>((resolve) => httpServer.close(() => resolve()));
		},
	};
}

@Injectable()
export class SubscriptionsService
	implements OnApplicationBootstrap, OnModuleDestroy
{
	private readonly log = createEverLogger({ name: 'subscriptions' });

	private server?: SubscriptionsServer;

	constructor(
		private readonly moduleRef: ModuleRef,
		@Inject(SUBSCRIPTIONS_PORT) private readonly port: number
	) {}

	async onApplicationBootstrap() {
		// GraphQLModule builds the schema in its onModuleInit, so it is ready
		// now. Its schema host is not exported, hence the non-strict lookup.
		const { schema } = this.moduleRef.get(GraphQLSchemaHost, {
			strict: false,
		});

		this.server = await startSubscriptionsServer(schema, this.port);

		this.log.info(
			`GraphQL subscriptions (graphql-ws) at ws://localhost:${this.server.port}${SUBSCRIPTIONS_PATH}`
		);
		console.log(
			`GraphQL subscriptions (graphql-ws) listening at ws://localhost:${this.server.port}${SUBSCRIPTIONS_PATH}`
		);
	}

	async onModuleDestroy() {
		await this.server?.close();
		this.server = undefined;
	}
}
