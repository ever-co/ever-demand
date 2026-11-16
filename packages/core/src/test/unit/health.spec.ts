import mongoose from 'mongoose';
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
	// mongoose Connection.readyState: 0 disconnected, 1 connected, 2 connecting,
	// 3 disconnecting, 99 uninitialized
	const connected = { readyState: 1 };
	const disconnected = { readyState: 0 };

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

	it('readiness sets 503 while the connection is connecting, disconnecting or uninitialized', () => {
		for (const readyState of [2, 3, 99]) {
			const res = { status: jest.fn() };
			new HealthController({ readyState }).ready(res);
			expect(res.status).toHaveBeenCalledWith(503);
		}
	});

	it('readiness follows the live connection state, not the state at startup', () => {
		const db = { readyState: 1 };
		const controller = new HealthController(db);

		const before = { status: jest.fn() };
		expect(controller.ready(before).status).toBe('ok');
		expect(before.status).not.toHaveBeenCalled();

		db.readyState = 0; // MongoDB went away after startup
		const during = { status: jest.fn() };
		expect(controller.ready(during).checks.database).toBe('unavailable');
		expect(during.status).toHaveBeenCalledWith(503);

		db.readyState = 1; // and came back
		const after = { status: jest.fn() };
		expect(controller.ready(after).status).toBe('ok');
		expect(after.status).not.toHaveBeenCalled();
	});

	it('defaults to the mongoose default connection (not connected in unit tests)', () => {
		expect(mongoose.connection.readyState).toBe(0);
		const res = { status: jest.fn() };
		new HealthController().ready(res);
		expect(res.status).toHaveBeenCalledWith(503);
	});
});
