import { Client, createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { adminToken, gqlData, PyroClient, unique } from './helpers';
import { SUBSCRIPTIONS_URL } from './server';

/**
 * graphql-ws server on GQLPORT_SUBSCRIPTIONS, path /subscriptions: what
 * GraphQLWsLink (@apollo/client/link/subscriptions) + createClient connect to.
 */
describe('GraphQL subscriptions over graphql-ws', () => {
	const clients: Client[] = [];
	const pyro = new PyroClient();

	function connect(connectionParams?: Record<string, unknown>): Client {
		const client = createClient({
			url: SUBSCRIPTIONS_URL,
			webSocketImpl: WebSocket,
			connectionParams,
			retryAttempts: 0,
			lazy: true,
		});
		clients.push(client);
		return client;
	}

	function once<T = any>(client: Client, query: string): Promise<{ data?: T; errors?: unknown[] }> {
		return new Promise((resolve, reject) => {
			let result: any;
			client.subscribe(
				{ query },
				{
					next: (value) => {
						result = value;
					},
					error: reject,
					complete: () => resolve(result),
				}
			);
		});
	}

	afterAll(async () => {
		pyro.close();
		await Promise.all(clients.map((c) => c.dispose()));
	});

	it('acknowledges the connection and runs a query', async () => {
		const client = connect();

		let acknowledged = false;
		client.on('connected', () => {
			acknowledged = true;
		});

		const result = await once(client, `{ adminAppSettings { fakeDataGenerator } }`);

		expect(acknowledged).toBe(true);
		expect(result.errors).toBeUndefined();
		expect(result.data).toEqual({ adminAppSettings: { fakeDataGenerator: 1 } });
	});

	it('passes the token of connectionParams to resolvers as the Authorization header', async () => {
		const token = await adminToken();

		const withBearer = await once(
			connect({ authorization: `Bearer ${token}` }),
			`{ adminAuthenticated }`
		);
		const withBareToken = await once(connect({ Authorization: token }), `{ adminAuthenticated }`);
		const anonymous = await once(connect(), `{ adminAuthenticated }`);

		expect(withBearer.data).toEqual({ adminAuthenticated: true });
		expect(withBareToken.data).toEqual({ adminAuthenticated: true });
		expect(anonymous.data).toEqual({ adminAuthenticated: false });
	});

	it('pushes deviceCreated events published by updateDevice', async () => {
		const device = await pyro.call<{ _id: string; channelId: string }>('device', 'create', {
			channelId: `channel-${unique()}`,
			type: 'browser',
			uuid: unique(),
			language: 'en-US',
		});

		const client = connect();
		const events: any[] = [];

		const received = new Promise<any>((resolve, reject) => {
			const dispose = client.subscribe(
				{ query: `subscription { deviceCreated { id language channelId } }` },
				{
					next: (value) => {
						events.push(value);
						const created = (value.data as any)?.deviceCreated;
						if (created?.id === device._id) {
							dispose();
							resolve(created);
						}
					},
					error: reject,
					complete: () => undefined,
				}
			);
		});

		// the subscription is registered once the server got `subscribe`;
		// publish a few times so a slow start can not lose the only event
		const publish = async () =>
			gqlData(
				`mutation Update($id: String!) { updateDevice(id: $id, updateInput: { language: "he-IL" }) { id } }`,
				{ id: device._id }
			);

		const timer = setInterval(() => {
			publish().catch(() => undefined);
		}, 300);

		try {
			await expect(received).resolves.toEqual({
				id: device._id,
				language: 'he-IL',
				channelId: device.channelId,
			});
		} finally {
			clearInterval(timer);
		}
	});

	it('reports a GraphQL error for an invalid subscription', async () => {
		const client = connect();

		await expect(once(client, `subscription { noSuchEvent }`)).rejects.toEqual(
			expect.arrayContaining([expect.objectContaining({ message: expect.stringMatching(/noSuchEvent/) })])
		);
	});
});
