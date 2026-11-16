import {
	Controller,
	Get,
	Header,
	HttpStatus,
	Optional,
	Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Connection } from 'typeorm';
import { buildHealthReport, HealthReport } from './health';

/**
 * Unauthenticated endpoints for load balancers, orchestrators and uptime monitors:
 *  - GET /api/health        liveness: always 200 while the process serves requests
 *                           (the body also reports the database state)
 *  - GET /api/health/ready  readiness: 200 only when the database connection is
 *                           established, otherwise 503
 * Neither endpoint exposes configuration, data or error details.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(@Optional() private readonly connection?: Connection) {}

	@Get()
	@Header('Cache-Control', 'no-store')
	live(): HealthReport {
		return buildHealthReport(this.isDatabaseConnected(), process.uptime());
	}

	// The status is set on the response (instead of throwing an exception) so that
	// the `Cache-Control: no-store` header is also sent with a 503.
	@Get('ready')
	@Header('Cache-Control', 'no-store')
	ready(@Res({ passthrough: true }) res: Pick<Response, 'status'>): HealthReport {
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
		return !!this.connection && this.connection.isConnected === true;
	}
}
