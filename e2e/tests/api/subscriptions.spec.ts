import { expect, test } from '@playwright/test';
import { createClient } from 'graphql-ws';
import { ADMIN, gqlData, PyroClient, SUBSCRIPTIONS_URL, unique, adminToken } from './api-helpers';

/**
 * graphql-ws at ws://<host>:2086/subscriptions: what GraphQLWsLink +
 * createClient of the apps connect to. Node's global WebSocket is used.
 */
test.describe('GraphQL subscriptions (graphql-ws)', () => {
	const connect = (connectionParams?: Record<string, unknown>) =>
		createClient({ url: SUBSCRIPTIONS_URL, connectionParams, retryAttempts: 0, lazy: true });

	const run = (client: ReturnType<typeof connect>, query: string) =>
		new Promise<any>((resolve, reject) => {
			let value: any;
			client.subscribe({ query }, { next: (v) => (value = v), error: reject, complete: () => resolve(value) });
		});

	test('runs an operation and passes the connectionParams token as Authorization', async () => {
		const { adminLogin } = await gqlData(
			`mutation L($email: String!, $password: String!) { adminLogin(email: $email, password: $password) { token } }`,
			ADMIN
		);

		const authenticated = connect({ authorization: `Bearer ${adminLogin.token}` });
		const anonymous = connect();

		try {
			expect((await run(authenticated, '{ adminAuthenticated }')).data).toEqual({ adminAuthenticated: true });
			expect((await run(anonymous, '{ adminAuthenticated }')).data).toEqual({ adminAuthenticated: false });
		} finally {
			await authenticated.dispose();
			await anonymous.dispose();
		}
	});

	test('deviceCreated pushes the update of a device', async () => {
		const pyro = new PyroClient();
		// deviceCreated is admin-only and limited to the admin's tenant
		const client = connect({ authorization: `Bearer ${await adminToken()}` });

		try {
			const device = await pyro.call('device', 'create', {
				channelId: `e2e-${unique()}`,
				type: 'browser',
				uuid: unique(),
				language: 'en-US',
			});

			const received = new Promise<any>((resolve, reject) => {
				const dispose = client.subscribe(
					{ query: 'subscription { deviceCreated { id language } }' },
					{
						next: ({ data }: any) => {
							if (data?.deviceCreated?.id === device._id) {
								dispose();
								resolve(data.deviceCreated);
							}
						},
						error: reject,
						complete: () => undefined,
					}
				);
			});

			// publish until the subscription (registered asynchronously) gets one
			const timer = setInterval(() => {
				gqlData(`mutation U($id: String!) { updateDevice(id: $id, updateInput: { language: "he-IL" }) { id } }`, {
					id: device._id,
				}).catch(() => undefined);
			}, 300);

			try {
				expect(await received).toEqual({ id: device._id, language: 'he-IL' });
			} finally {
				clearInterval(timer);
			}
		} finally {
			pyro.close();
			await client.dispose();
		}
	});
});
