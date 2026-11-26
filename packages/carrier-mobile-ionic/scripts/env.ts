// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!
//
// Runs on Node's built-in TypeScript type stripping (`node scripts/configure.ts`),
// so only erasable TypeScript syntax is allowed here.

import { randomUUID } from 'node:crypto';
import { bool, cleanEnv, num, str } from 'envalid';

// Node's built-in replacement for `dotenv`: a missing .env file is fine.
try {
	process.loadEnvFile('.env');
} catch {
	// no .env file: defaults and the real environment apply
}

export type Env = Readonly<{
	production: boolean;

	// Graphql endpoints for apollo services
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;

	// Multi-tenant (docs/multi-tenant/DESIGN.md §3.3, §3.5): a white-label build's tenant
	// slug or id, and the parent domain of `<slug>.<TENANT_BASE_DOMAIN>` app hosts.
	TENANT: string;
	TENANT_BASE_DOMAIN: string;

	APP_VERSION: string;

	GOOGLE_MAPS_API_KEY: string;
	GOOGLE_ANALYTICS_API_KEY: string;
	FAKE_UUID: string;
	// Not secret MixPanel Token
	MIXPANEL_API_KEY: string;

	DEFAULT_CUSTOMER_LOGO: string;
	LOGIN_LOGO: string;
	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;
	APP_NAME: string;

	DEFAULT_LOGIN_USERNAME: string;
	DEFAULT_LOGIN_PASSWORD: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	DEFAULT_LANGUAGE: string;

	// For maintenance micro service
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;

}>;

export const env: Env = cleanEnv(process.env, {
	production: bool({ default: false }),

	APP_VERSION: str({ default: '0.2.0' }),

	DEFAULT_CUSTOMER_LOGO: str({
		default:
			'http://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',
	}),

	LOGIN_LOGO: str({ default: 'assets/imgs/ever-logo.svg' }),
	NO_INTERNET_LOGO: str({ default: 'assets/imgs/ever-logo.svg' }),

	COMPANY_NAME: str({ default: 'Ever Co. LTD' }),
	APP_NAME: str({ default: 'Ever® Carrier' }),

	DEFAULT_LOGIN_USERNAME: str({ default: 'ever' }),
	// Demo builds may prefill the login form through the environment; never a default.
	DEFAULT_LOGIN_PASSWORD: str({ default: '' }),

	GOOGLE_MAPS_API_KEY: str({ default: '' }),

	GOOGLE_ANALYTICS_API_KEY: str({ default: '' }),
	FAKE_UUID: str({ default: randomUUID() }),

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: str({ default: '' }),

	DEFAULT_LATITUDE: num({ default: 42.6459136 }),
	DEFAULT_LONGITUDE: num({ default: 23.3932736 }),

	DEFAULT_LANGUAGE: str({ default: 'en' }),

	// Graphql endpoints for apollo services
	GQL_ENDPOINT: str({ default: 'http://localhost:8443/graphql' }),
	GQL_SUBSCRIPTIONS_ENDPOINT: str({
		default: 'ws://localhost:2086/subscriptions',
	}),
	SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
	HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:2087' }),

	// '' = not set. Carrier logins need no tenant (the login token carries it); when
	// set, the app names it before login and the API refuses other tenants' carriers.
	TENANT: str({ default: '' }),
	TENANT_BASE_DOMAIN: str({ default: '' }),

	// For maintenance micro service. Ever maintenance API URL: https://maintenance.ever.co/status
	SETTINGS_APP_TYPE: str({ default: 'carrier-mobile' }),
	SETTINGS_MAINTENANCE_API_URL: str({
		default: '',
	}),

});
