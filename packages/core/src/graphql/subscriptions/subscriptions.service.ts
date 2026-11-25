import http from 'http';
import {
	Inject,
	Injectable,
	OnApplicationBootstrap,
	OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import type { GraphQLSchema } from 'graphql';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { createWsGraphQLContext } from '../graphql-context';
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

	const serverCleanup = useServer(
		{
			schema,
			context: (ctx) =>
				createWsGraphQLContext(
					ctx.connectionParams,
					ctx.extra.request.headers
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
