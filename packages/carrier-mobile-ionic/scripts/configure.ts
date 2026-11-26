// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!
//
// Usage: node scripts/configure.ts --environment=dev|prod
// (Node 26 runs TypeScript directly through type stripping.)

import { unlinkSync, writeFileSync } from 'node:fs';
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

// JSON.stringify quotes and escapes every string value.
const q = (value: string | undefined) => JSON.stringify(value ?? '');

const envFileContent = `// NOTE: Auto-generated file (scripts/configure.ts), do not edit.
// 'environment.ts' is used for development builds; the production build
// replaces it with 'environment.prod.ts' (see angular.json fileReplacements).

import { Environment } from './model';

export const environment: Environment = {
	production: ${isProd},
	SERVICES_ENDPOINT: ${q(env.SERVICES_ENDPOINT)},
	HTTPS_SERVICES_ENDPOINT: ${q(env.HTTPS_SERVICES_ENDPOINT)},

	GQL_ENDPOINT: ${q(env.GQL_ENDPOINT)},
	GQL_SUBSCRIPTIONS_ENDPOINT: ${q(env.GQL_SUBSCRIPTIONS_ENDPOINT)},

	// Multi-tenant (docs/multi-tenant/DESIGN.md §3.3)
	TENANT: ${q(env.TENANT)},
	TENANT_BASE_DOMAIN: ${q(env.TENANT_BASE_DOMAIN)},

	APP_VERSION: ${q(env.APP_VERSION)},

	GOOGLE_MAPS_API_KEY: ${q(env.GOOGLE_MAPS_API_KEY)},
	GOOGLE_ANALYTICS_API_KEY: ${q(env.GOOGLE_ANALYTICS_API_KEY)},
	FAKE_UUID: ${q(env.FAKE_UUID)},
	// Not secret MixPanel Token
	MIXPANEL_API_KEY: ${q(env.MIXPANEL_API_KEY)},

	DEFAULT_CUSTOMER_LOGO: ${q(env.DEFAULT_CUSTOMER_LOGO)},

	LOGIN_LOGO: ${q(env.LOGIN_LOGO)},
	NO_INTERNET_LOGO: ${q(env.NO_INTERNET_LOGO)},

	COMPANY_NAME: ${q(env.COMPANY_NAME)},
	APP_NAME: ${q(env.APP_NAME)},

	DEFAULT_LOGIN_USERNAME: ${q(env.DEFAULT_LOGIN_USERNAME)},
	DEFAULT_LOGIN_PASSWORD: ${q(env.DEFAULT_LOGIN_PASSWORD)},

	DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
	DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

	DEFAULT_LANGUAGE: ${q(env.DEFAULT_LANGUAGE)},

	// For maintenance micro service
	SETTINGS_APP_TYPE: ${q(env.SETTINGS_APP_TYPE)},
	SETTINGS_MAINTENANCE_API_URL: ${q(env.SETTINGS_MAINTENANCE_API_URL)},
};
`;

const envFileDest = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther = isProd ? 'environment.ts' : 'environment.prod.ts';

// Always remove the old generated files first.
for (const file of ['environment.ts', 'environment.prod.ts']) {
	try {
		unlinkSync(`./src/environments/${file}`);
	} catch {
		// not generated yet
	}
}

for (const file of [envFileDest, envFileDestOther]) {
	writeFileSync(`./src/environments/${file}`, envFileContent);
	console.log(`Generated Angular environment file: ${file}`);
}
