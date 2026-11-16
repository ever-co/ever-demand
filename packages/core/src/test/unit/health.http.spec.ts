import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Connection } from 'typeorm';
import { HealthController } from '../../controllers/health/health.controller';

async function createApp(
	connection?: Partial<Connection>
): Promise<INestApplication> {
	const moduleRef = await Test.createTestingModule({
		controllers: [HealthController],
		providers: connection ? [{ provide: Connection, useValue: connection }] : [],
	}).compile();

	const app = moduleRef.createNestApplication();
	// same prefix as the real bootstrap (see nest-bootstrap.ts)
	app.setGlobalPrefix('api');
	await app.init();
	return app;
}

describe('health endpoints over HTTP', () => {
	let app: INestApplication;

	afterEach(async () => {
		await app?.close();
	});

	it('GET /api/health returns 200 with no-store when the database is connected', async () => {
		app = await createApp({ isConnected: true });

		const res = await request(app.getHttpServer()).get('/api/health');

		expect(res.status).toBe(200);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('ok');
		expect(res.body.checks).toEqual({ database: 'ok' });
		expect(typeof res.body.uptimeSeconds).toBe('number');
	});

	it('GET /api/health still returns 200 when the database is down', async () => {
		app = await createApp({ isConnected: false });

		const res = await request(app.getHttpServer()).get('/api/health');

		expect(res.status).toBe(200);
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});

	it('GET /api/health/ready returns 200 when the database is connected', async () => {
		app = await createApp({ isConnected: true });

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(200);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('ok');
	});

	it('GET /api/health/ready returns 503 with the report when the database is down', async () => {
		app = await createApp({ isConnected: false });

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(503);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('unavailable');
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});

	it('GET /api/health/ready returns 503 when no connection is registered', async () => {
		app = await createApp();

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(503);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});
});
