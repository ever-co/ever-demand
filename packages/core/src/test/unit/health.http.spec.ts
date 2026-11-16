import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
	HEALTH_DB_CONNECTION,
	HealthController,
	HealthDbConnection,
} from '../../controllers/health/health.controller';

async function createApp(db?: HealthDbConnection): Promise<INestApplication> {
	const moduleRef = await Test.createTestingModule({
		controllers: [HealthController],
		providers: db ? [{ provide: HEALTH_DB_CONNECTION, useValue: db }] : [],
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
		app = await createApp({ readyState: 1 });

		const res = await request(app.getHttpServer()).get('/api/health');

		expect(res.status).toBe(200);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('ok');
		expect(res.body.checks).toEqual({ database: 'ok' });
		expect(typeof res.body.uptimeSeconds).toBe('number');
		expect(Object.keys(res.body).sort()).toEqual([
			'checks',
			'status',
			'uptimeSeconds',
		]);
	});

	it('GET /api/health still returns 200 when the database is down', async () => {
		app = await createApp({ readyState: 0 });

		const res = await request(app.getHttpServer()).get('/api/health');

		expect(res.status).toBe(200);
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});

	it('GET /api/health/ready returns 200 when the database is connected', async () => {
		app = await createApp({ readyState: 1 });

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(200);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('ok');
	});

	it('GET /api/health/ready returns 503 with the report when the database is down', async () => {
		app = await createApp({ readyState: 0 });

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(503);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.status).toBe('unavailable');
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});

	it('GET /api/health/ready turns 503 when the database goes away after startup', async () => {
		const db = { readyState: 1 };
		app = await createApp(db);

		const up = await request(app.getHttpServer()).get('/api/health/ready');
		expect(up.status).toBe(200);

		db.readyState = 0;
		const down = await request(app.getHttpServer()).get(
			'/api/health/ready'
		);
		expect(down.status).toBe(503);
		expect(down.body.checks).toEqual({ database: 'unavailable' });
	});

	it('GET /api/health/ready falls back to the mongoose default connection (not connected here) and returns 503', async () => {
		app = await createApp();

		const res = await request(app.getHttpServer()).get('/api/health/ready');

		expect(res.status).toBe(503);
		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.body.checks).toEqual({ database: 'unavailable' });
	});
});
