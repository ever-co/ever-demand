import request from 'supertest';
import { API_URL, SERVICES_URL, SUBSCRIPTIONS_PORT } from './server';

describe('API endpoints are up', () => {
	it('GET /api/health is ok, with the database connected and no caching', async () => {
		const res = await request(API_URL).get('/api/health');

		expect(res.status).toBe(200);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body).toEqual({
			status: 'ok',
			uptimeSeconds: expect.any(Number),
			checks: { database: 'ok' },
		});
		// health probes never get a session cookie
		expect(res.headers['set-cookie']).toBeUndefined();
	});

	it('GET /api/health/ready is 200 once the database is connected', async () => {
		const res = await request(API_URL).get('/api/health/ready');

		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
	});

	it('sets the helmet security headers on the NestJS app', async () => {
		const res = await request(API_URL).get('/api/health');

		expect(res.headers['x-content-type-options']).toBe('nosniff');
		expect(res.headers['x-powered-by']).toBeUndefined();
	});

	it('answers CORS preflights of the apps for GraphQL', async () => {
		const res = await request(API_URL)
			.options('/graphql')
			.set('Origin', 'http://localhost:4200')
			.set('Access-Control-Request-Method', 'POST')
			.set('Access-Control-Request-Headers', 'content-type,authorization');

		expect(res.status).toBe(204);
		expect(res.headers['access-control-allow-origin']).toBe('*');
		expect(res.headers['access-control-allow-headers']).toMatch(/Authorization/);
	});

	it('serves the Swagger UI at /swg and its OpenAPI document', async () => {
		const page = await request(API_URL).get('/swg').redirects(2);
		expect(page.status).toBe(200);
		expect(page.text).toMatch(/swagger/i);

		const doc = await request(API_URL).get('/swg-json');
		expect(doc.status).toBe(200);
		expect(doc.body.info.title).toBe('Ever Demand REST API');
		expect(Object.keys(doc.body.paths)).toEqual(
			expect.arrayContaining(['/api/health', '/api/health/ready'])
		);
	});

	it('serves the GraphiQL landing page at GET /graphql', async () => {
		const res = await request(API_URL).get('/graphql').set('Accept', 'text/html');

		expect(res.status).toBe(200);
		expect(res.text).toMatch(/graphiql/i);
		// its CDN scripts would be refused by the default CSP of helmet
		expect(res.headers['content-security-policy']).toBeUndefined();
		expect(res.headers['x-content-type-options']).toBe('nosniff');

		const other = await request(API_URL).get('/api/health');
		expect(other.headers['content-security-policy']).toMatch(/script-src 'self'/);
	});

	it('serves the express pages of the services port', async () => {
		const index = await request(SERVICES_URL).get('/');
		expect(index.status).toBe(200);
		expect(index.headers['content-type']).toMatch(/html/);

		const terms = await request(SERVICES_URL).get('/en/terms');
		expect(terms.status).toBe(200);
	});

	it('answers the socket.io handshake, with CORS for the apps', async () => {
		const res = await request(SERVICES_URL)
			.get('/socket.io/?EIO=4&transport=polling')
			.set('Origin', 'http://localhost:4201');

		expect(res.status).toBe(200);
		expect(res.text).toMatch(/"sid":/);
		expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4201');
	});

	it('only takes WebSocket upgrades on the subscriptions port', async () => {
		const res = await request(`http://127.0.0.1:${SUBSCRIPTIONS_PORT}`).get('/subscriptions');

		expect(res.status).toBe(426);
	});
});
