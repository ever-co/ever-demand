import { ServiceUnavailableException } from '@nestjs/common';
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

	it('readiness returns the report when the database is connected', () => {
		const report = new HealthController(connected).ready();
		expect(report.status).toBe('ok');
	});

	it('readiness throws 503 when the database is disconnected', () => {
		const controller = new HealthController(disconnected);
		expect(() => controller.ready()).toThrow(ServiceUnavailableException);
	});

	it('readiness throws 503 when there is no connection at all', () => {
		const controller = new HealthController(undefined);
		expect(() => controller.ready()).toThrow(ServiceUnavailableException);
	});
});
