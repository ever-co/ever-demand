import {
	Controller,
	Get,
	INestApplication,
	Injectable,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard, PassportModule, PassportStrategy } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import expressSession from 'express-session';
import { sign } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import request from 'supertest';
import {
	HEALTH_DB_CONNECTION,
	HealthController,
} from '../../controllers/health/health.controller';
import {
	createSessionMiddleware,
	isSessionlessPath,
} from '../../helpers/session-middleware';

const JWT_TEST_SECRET = 'jwt-test-secret';

// Same wiring as the real API strategies: Bearer token in, user out, no session.
@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: JWT_TEST_SECRET,
		});
	}

	validate(payload: { sub: string }) {
		return { id: payload.sub };
	}
}

@Controller('ping')
class PingController {
	@Get()
	ping() {
		return { pong: true };
	}

	@Get('write')
	write(@Req() req: any) {
		req.session.touched = true;
		return { written: true };
	}

	@Get('secure')
	@UseGuards(AuthGuard('jwt'))
	secure(@Req() req: any) {
		return { user: req.user.id };
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
			imports: [PassportModule],
			providers: [
				{ provide: HEALTH_DB_CONNECTION, useValue: { readyState: 1 } },
				TestJwtStrategy,
			],
		}).compile();

		app = moduleRef.createNestApplication();
		// same options and order as the real bootstrap (see nest-bootstrap.ts);
		// `saveUninitialized: false` comes from createSessionMiddleware itself
		app.use(
			createSessionMiddleware({
				secret: 'test-secret',
				resave: true,
				store,
			})
		);
		app.setGlobalPrefix('api');
		await app.init();
	});

	afterEach(async () => {
		await app?.close();
	});

	it.each([
		'/api/health',
		'/api/health/ready',
		'/api/health/',
		'/api/HEALTH',
	])('%s sets no session cookie and creates no session', async (path) => {
		const res = await request(app.getHttpServer()).get(path);

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']).toBeUndefined();
		expect(await sessionCount(store)).toBe(0);
	});

	it('ignores the query string when matching the health path', async () => {
		const res = await request(app.getHttpServer()).get('/api/health?x=1');

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']).toBeUndefined();
		expect(await sessionCount(store)).toBe(0);
	});

	it('creates no session and sets no cookie for a cookieless request to a normal route', async () => {
		const res = await request(app.getHttpServer()).get('/api/ping');

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']).toBeUndefined();
		expect(await sessionCount(store)).toBe(0);
	});

	it('still stores a session once a handler writes to it', async () => {
		const res = await request(app.getHttpServer()).get('/api/ping/write');

		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']?.[0]).toMatch(/^connect\.sid=/);
		expect(await sessionCount(store)).toBe(1);
	});

	it('authenticates with a Bearer JWT (Passport) and needs no session or cookie', async () => {
		const token = sign({ sub: 'user-1' }, JWT_TEST_SECRET);

		const ok = await request(app.getHttpServer())
			.get('/api/ping/secure')
			.set('Authorization', `Bearer ${token}`);
		const denied = await request(app.getHttpServer()).get(
			'/api/ping/secure'
		);

		expect(ok.status).toBe(200);
		expect(ok.body).toEqual({ user: 'user-1' });
		expect(ok.headers['set-cookie']).toBeUndefined();
		expect(denied.status).toBe(401);
		expect(denied.headers['set-cookie']).toBeUndefined();
		expect(await sessionCount(store)).toBe(0);
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

	it('matches like Express routing: one optional trailing slash, any case', () => {
		expect(isSessionlessPath('/API/Health/Ready/')).toBe(true);
		// Express does not route these to the health controller (404), so they keep the session
		expect(isSessionlessPath('/api/health//')).toBe(false);
		expect(isSessionlessPath('/api/health/ready//')).toBe(false);
	});

	it('returns quickly for a very long path (no quadratic regex on every request)', () => {
		// ~16 KB is the most Node accepts in a request line by default
		const path = '/' + '/'.repeat(16000) + 'a';
		const start = Date.now();

		expect(isSessionlessPath(path)).toBe(false);
		expect(isSessionlessPath('/api/health' + '/'.repeat(16000))).toBe(
			false
		);
		expect(Date.now() - start).toBeLessThan(50);
	});
});
