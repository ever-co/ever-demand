// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!
//
// Generates src/environments/environment.ts and environment.prod.ts from the env (see ./env.ts).
// Usage: node scripts/configure.ts [--environment=prod|dev]

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { env } from './env.ts';

const { values } = parseArgs({
	options: { environment: { type: 'string', default: 'dev' } },
	strict: false,
});

const isProd = values.environment === 'prod';

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

const envFileContent = `// NOTE: Auto-generated file (scripts/configure.ts). Do not edit, do not commit.
// 'ng build --configuration production' replaces environment.ts with environment.prod.ts;
// configure.ts writes the same settings to both files.

import { Environment } from './model';

export const environment: Environment = {
	production: ${isProd},

	DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
	DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

	DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',

	SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
	HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
	GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
	GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',

	// Multi-tenant (docs/multi-tenant/DESIGN.md §3.3)
	TENANT: '${env.TENANT}',
	TENANT_BASE_DOMAIN: '${env.TENANT_BASE_DOMAIN}',

	AUTH_LOGO: '${env.AUTH_LOGO}',
	NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',

	GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

	DELIVERY_TIME_MIN: ${env.DELIVERY_TIME_MIN},
	DELIVERY_TIME_MAX: ${env.DELIVERY_TIME_MAX},

	// For maintenance micro service. Ever maintanance API URL: https://maintenance.ever.co/status
	SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
	SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}',

	ENV_PROVIDERS: [],
};
`;

const environmentsDir = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'src',
	'environments'
);

for (const file of ['environment.ts', 'environment.prod.ts']) {
	writeFileSync(join(environmentsDir, file), envFileContent);
	console.log(
		`Generated Angular environment file: ${file} (${isProd ? 'prod' : 'dev'})`
	);
}
