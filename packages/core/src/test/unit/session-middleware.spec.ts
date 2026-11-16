import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import expressSession from 'express-session';
import request from 'supertest';
import {
	HEALTH_DB_CONNECTION,
	HealthController,
} from '../../controllers/health/health.controller';
import {
	createSessionMiddleware,
	isSessionlessPath,
} from '../../helpers/session-middleware';

@Controller('ping')
class PingController {
	@Get()
	ping() {
		return { pong: true };
	}
}

function sessionCount(store: expressSession.MemoryStore): Promise<number> {
	return new Promise((resolve, reject) =>
		store.length((err, n) => (err ? reject(err) : resolve(n as number)))
	);
}

describe('session middleware and health probes', () => {
	let app: INestApplication;
	let store: expressSession.MemoryStore;

	beforeEach(async () => {
		store = new expressSession.MemoryStore();

		const moduleRef = await Test.createTestingModule({
			controllers: [HealthController, PingController],
			providers: [
				{ provide: HEALTH_DB_CONNECTION, useValue: { readyState: 1 } },
			],
		}).compile();

		app = moduleRef.createNestApplication();
		// same options and order as the real bootstrap (see nest-bootstrap.ts)
		app.use(
			createSessionMiddleware({
				secret: 'test-secret',
				resave: true,
				saveUninitialized: true,
				store,
			})
		);
		app.setGlobalPrefix('api');
		await app.init();
	});

	afterEach(async () => {
		await app?.close();
	});

	it.each(['/api/health', '/api/health/ready', '/api/health/', '/api/HEALTH'])(
		'%s sets no session cookie and creates no session',
		async (path) => {
			const res = await request(app.getHttpServer()).get(path);

			expect(res.status).toBe(200);
			expect(res.headers['set-cookie']).toBeUndefined();
			expect(await sessionCount(store)).toBe(0);
		}
	);

	it('ignores the query string when matching the health path', async () => {
		const res = await request(app.getHttpServer()).get('/api/health?x=1');

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']).toBeUndefined();
		expect(await sessionCount(store)).toBe(0);
	});

	it('still creates a session and sets the cookie for a normal route', async () => {
		const res = await request(app.getHttpServer()).get('/api/ping');

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']?.[0]).toMatch(/^connect\.sid=/);
		expect(await sessionCount(store)).toBe(1);
	});

	it('does not skip look-alike paths', () => {
		expect(isSessionlessPath('/api/health/ready')).toBe(true);
		expect(isSessionlessPath('/api/health/other')).toBe(false);
		expect(isSessionlessPath('/api/healthz')).toBe(false);
		expect(isSessionlessPath('/health')).toBe(false);
		expect(isSessionlessPath('/api/ping/api/health')).toBe(false);
		expect(isSessionlessPath('')).toBe(false);
		expect(isSessionlessPath(undefined)).toBe(false);
	});
});
