import { buildHealthReport } from '../../controllers/health/health';
import { HealthController } from '../../controllers/health/health.controller';

describe('buildHealthReport', () => {
	it('reports ok when the database is connected', () => {
		expect(buildHealthReport(true, 12.9)).toEqual({
			status: 'ok',
			uptimeSeconds: 12,
			checks: { database: 'ok' },
		});
	});

	it('reports unavailable when the database is not connected', () => {
		const report = buildHealthReport(false, 5);
		expect(report.status).toBe('unavailable');
		expect(report.checks.database).toBe('unavailable');
	});

	it('never reports a negative or non-finite uptime', () => {
		for (const uptime of [-1, NaN, Infinity, -Infinity]) {
			expect(buildHealthReport(true, uptime).uptimeSeconds).toBe(0);
		}
	});
});

describe('HealthController', () => {
	const connected = { isConnected: true } as any;
	const disconnected = { isConnected: false } as any;

	it('liveness answers even when the database is down', () => {
		const report = new HealthController(disconnected).live();
		expect(report.checks.database).toBe('unavailable');
	});

	it('readiness keeps the default status when the database is connected', () => {
		const res = { status: jest.fn() };
		const report = new HealthController(connected).ready(res);
		expect(report.status).toBe('ok');
		expect(res.status).not.toHaveBeenCalled();
	});

	it('readiness sets 503 when the database is disconnected', () => {
		const res = { status: jest.fn() };
		const report = new HealthController(disconnected).ready(res);
		expect(report.status).toBe('unavailable');
		expect(res.status).toHaveBeenCalledWith(503);
	});

	it('readiness sets 503 when there is no connection at all', () => {
		const res = { status: jest.fn() };
		new HealthController(undefined).ready(res);
		expect(res.status).toHaveBeenCalledWith(503);
	});
});
