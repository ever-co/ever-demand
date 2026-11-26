import { expect, test } from '@playwright/test';
import { GQL_URL, SERVICES_URL, SUBSCRIPTIONS_URL } from './api-helpers';

const API_ORIGIN = new URL(GQL_URL).origin;

test.describe('API is up', () => {
	test('GET /api/health reports ok with the database connected', async ({ request }) => {
		const res = await request.get(`${API_ORIGIN}/api/health`);

		expect(res.status()).toBe(200);
		expect(res.headers()['cache-control']).toBe('no-store');
		expect(await res.json()).toMatchObject({ status: 'ok', checks: { database: 'ok' } });
	});

	test('GET /api/health/ready is 200', async ({ request }) => {
		expect((await request.get(`${API_ORIGIN}/api/health/ready`)).status()).toBe(200);
	});

	test('the GraphiQL landing page is served at /graphql', async ({ request }) => {
		const res = await request.get(GQL_URL, { headers: { accept: 'text/html' } });

		expect(res.status()).toBe(200);
		expect(await res.text()).toMatch(/graphiql/i);
	});

	test('the socket.io endpoint answers the handshake with CORS for the apps', async ({ request }) => {
		const res = await request.get(`${SERVICES_URL}/socket.io/?EIO=4&transport=polling`, {
			headers: { origin: 'http://localhost:4200' },
		});

		expect(res.status()).toBe(200);
		expect(await res.text()).toContain('"sid"');
		expect(res.headers()['access-control-allow-origin']).toBe('http://localhost:4200');
	});

	test('the subscriptions port only takes WebSocket upgrades', async ({ request }) => {
		const url = SUBSCRIPTIONS_URL.replace(/^ws/, 'http');

		expect((await request.get(url)).status()).toBe(426);
	});
});
