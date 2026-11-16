export type HealthStatus = 'ok' | 'unavailable';

export interface HealthReport {
	status: HealthStatus;
	/** Seconds since the API process started (never negative). */
	uptimeSeconds: number;
	checks: {
		database: HealthStatus;
	};
}

/**
 * Builds the body of the health endpoints.
 * Kept free of NestJS/TypeORM so it can be unit tested on its own.
 *
 * @param {boolean} isDatabaseConnected whether the database connection is established
 * @param {number} uptimeSeconds process uptime in seconds
 */
export function buildHealthReport(
	isDatabaseConnected: boolean,
	uptimeSeconds: number
): HealthReport {
	const database: HealthStatus = isDatabaseConnected ? 'ok' : 'unavailable';

	return {
		status: database,
		uptimeSeconds:
			Number.isFinite(uptimeSeconds) && uptimeSeconds > 0
				? Math.floor(uptimeSeconds)
				: 0,
		checks: { database },
	};
}
