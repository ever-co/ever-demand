import {
	Controller,
	Get,
	Header,
	Optional,
	ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

	@Get('ready')
	@Header('Cache-Control', 'no-store')
	ready(): HealthReport {
		const report = buildHealthReport(
			this.isDatabaseConnected(),
			process.uptime()
		);

		if (report.status !== 'ok') {
			throw new ServiceUnavailableException(report);
		}

		return report;
	}

	private isDatabaseConnected(): boolean {
		return !!this.connection && this.connection.isConnected === true;
	}
}
