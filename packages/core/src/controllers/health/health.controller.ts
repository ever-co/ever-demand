import {
	Controller,
	Get,
	Header,
	HttpStatus,
	Inject,
	Optional,
	Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import mongoose from 'mongoose';
import { buildHealthReport, HealthReport } from './health';

/**
 * Optional injection token for the database connection the health checks read.
 * The app does not provide it, so the mongoose default connection is used.
 * Tests provide a stub.
 */
export const HEALTH_DB_CONNECTION = 'HEALTH_DB_CONNECTION';

/** The only part of a mongoose connection the health checks read. */
export type HealthDbConnection = Pick<mongoose.Connection, 'readyState'>;

/**
 * Unauthenticated endpoints for load balancers, orchestrators and uptime monitors:
 *  - GET /api/health        liveness: always 200 while the process serves requests
 *                           (the body also reports the database state)
 *  - GET /api/health/ready  readiness: 200 only when the database connection is
 *                           established, otherwise 503
 * Neither endpoint exposes configuration, data or error details.
 *
 * The database state comes from the mongoose default connection, which all services
 * use (see ServicesApp._connectDB). Its readyState follows the MongoDB driver's server
 * monitoring: it drops to "disconnected" within seconds when MongoDB goes away and
 * returns to "connected" when it is back. TypeORM 0.2's Connection.isConnected is not
 * used, because it only changes on connect()/close() and stays true while MongoDB is down.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(
		@Optional()
		@Inject(HEALTH_DB_CONNECTION)
		private readonly db: HealthDbConnection = mongoose.connection
	) {}

	@Get()
	@Header('Cache-Control', 'no-store')
	live(): HealthReport {
		return buildHealthReport(this.isDatabaseConnected(), process.uptime());
	}

	// The status is set on the response (instead of throwing an exception) so that
	// the `Cache-Control: no-store` header is also sent with a 503.
	@Get('ready')
	@Header('Cache-Control', 'no-store')
	ready(
		@Res({ passthrough: true }) res: Pick<Response, 'status'>
	): HealthReport {
		const report = buildHealthReport(
			this.isDatabaseConnected(),
			process.uptime()
		);

		if (report.status !== 'ok') {
			res.status(HttpStatus.SERVICE_UNAVAILABLE);
		}

		return report;
	}

	private isDatabaseConnected(): boolean {
		return !!this.db && this.db.readyState === mongoose.STATES.connected;
	}
}
