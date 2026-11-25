import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

import {
	startSubscriptionsServer,
	SubscriptionsServer,
} from '../../../graphql/subscriptions/subscriptions.service';

describe('graphql-ws subscriptions server', () => {
	const pubSub = new PubSub();

	const schema = makeExecutableSchema({
		typeDefs: `
			type Query { whoAmI: String }
			type Subscription { ticked: Int! }
		`,
		resolvers: {
			Query: {
				whoAmI: (_root, _args, context) => context.req.headers.authorization ?? null,
			},
			Subscription: {
				ticked: { subscribe: () => pubSub.asyncIterableIterator('ticked') },
			},
		},
	});

	let server: SubscriptionsServer;

	beforeAll(async () => {
		// port 0: any free port
		server = await startSubscriptionsServer(schema, 0);
	});

	afterAll(async () => {
		await server.close();
	});

	const connect = (connectionParams?: Record<string, unknown>) =>
		createClient({
			url: `ws://127.0.0.1:${server.port}/subscriptions`,
			webSocketImpl: WebSocket,
			connectionParams,
			retryAttempts: 0,
		});

	it('streams subscription events', async () => {
		const client = connect();
		const values: number[] = [];

		const done = new Promise<void>((resolve, reject) => {
			const dispose = client.subscribe<{ ticked: number }>(
				{ query: 'subscription { ticked }' },
				{
					next: ({ data }) => {
						values.push(data.ticked);
						if (values.length === 2) {
							dispose();
							resolve();
						}
					},
					error: reject,
					complete: () => undefined,
				}
			);
		});

		const timer = setInterval(() => pubSub.publish('ticked', { ticked: values.length + 1 }), 50);

		try {
			await done;
		} finally {
			clearInterval(timer);
			await client.dispose();
		}

		expect(values.slice(0, 2)).toEqual([1, 2]);
	});

	it('gives resolvers the token of connectionParams as Authorization header', async () => {
		const client = connect({ authorization: 'token-1' });

		const result = await new Promise<any>((resolve, reject) => {
			let value: any;
			client.subscribe(
				{ query: '{ whoAmI }' },
				{ next: (v) => (value = v), error: reject, complete: () => resolve(value) }
			);
		});

		await client.dispose();

		expect(result.data).toEqual({ whoAmI: 'Bearer token-1' });
	});

	it('serves only the /subscriptions path', async () => {
		const socket = new WebSocket(`ws://127.0.0.1:${server.port}/other`, 'graphql-transport-ws');

		const failed = await new Promise<boolean>((resolve) => {
			socket.on('open', () => resolve(false));
			socket.on('error', () => resolve(true));
		});

		expect(failed).toBe(true);
	});

	it('refuses a port that is taken', async () => {
		await expect(startSubscriptionsServer(schema, server.port)).rejects.toThrow(/EADDRINUSE/);
	});
});
