/**
 * The API under test: ports, database and environment. Every value can be
 * overridden with an environment variable, so the suite can run next to an
 * API on the default ports (5500 / 2087 / 8443 / 2086).
 */
import path from 'path';

const env = (name: string, fallback: string) => process.env[name] || fallback;

export const CORE_DIR = path.resolve(__dirname, '../..');

export const MONGO_URL = env('CORE_E2E_MONGO_URL', 'mongodb://127.0.0.1:27018');
export const DB_NAME = env('CORE_E2E_DB_NAME', 'ever_core_e2e');

export const HOST = '127.0.0.1';
export const HTTP_PORT = Number(env('CORE_E2E_HTTPPORT', '15500'));
export const HTTPS_PORT = Number(env('CORE_E2E_HTTPSPORT', '12087'));
export const GQL_PORT = Number(env('CORE_E2E_GQLPORT', '18443'));
export const SUBSCRIPTIONS_PORT = Number(
	env('CORE_E2E_GQLPORT_SUBSCRIPTIONS', '12086')
);

/** socket.io "pyro" routers and the plain express routes */
export const SERVICES_URL = `http://${HOST}:${HTTP_PORT}`;
/** NestJS: REST under /api, GraphQL at /graphql */
export const API_URL = `http://${HOST}:${GQL_PORT}`;
export const GQL_URL = `${API_URL}/graphql`;
export const SUBSCRIPTIONS_URL = `ws://${HOST}:${SUBSCRIPTIONS_PORT}/subscriptions`;

export const JWT_SECRET = 'core-e2e-jwt-secret';

/** jest.e2e-mt.config.js runs the API as a multi-tenant SaaS (MULTI_TENANT=true). */
export const MULTI_TENANT = process.env.CORE_E2E_MULTI_TENANT === 'true';
export const TENANT_BASE_DOMAIN = 'everdemand.test';
/** Signing secret of the billing webhook under test (a fixed test value, not a Stripe secret) */
export const BILLING_WEBHOOK_SECRET = 'whsec_core_e2e_test_only';
/** Port of the fake Stripe API the multi-tenant suite starts (test/e2e/fake-stripe.ts) */
export const STRIPE_PORT = Number(env('CORE_E2E_STRIPE_PORT', '12188'));

export const TMP_DIR = path.join(CORE_DIR, 'tmp', 'e2e');
export const SERVER_LOG = path.join(TMP_DIR, 'server.log');

/** Environment of `node build/main.js` (on top of a clean process env). */
export function serverEnv(): NodeJS.ProcessEnv {
	return {
		NODE_ENV: 'test',
		API_HOST: HOST,
		HTTPPORT: String(HTTP_PORT),
		HTTPSPORT: String(HTTPS_PORT),
		GQLPORT: String(GQL_PORT),
		GQLPORT_SUBSCRIPTIONS: String(SUBSCRIPTIONS_PORT),
		DB_URI: `${MONGO_URL}/${DB_NAME}`,
		DB_NAME,
		DB_HOST: new URL(MONGO_URL).hostname,
		DB_PORT: new URL(MONGO_URL).port || '27017',
		JWT_SECRET,
		EXPRESS_SESSION_SECRET: 'core-e2e-session-secret',
		FAKE_DATA_GENERATOR: 'true',
		ADMIN_PASSWORD_RESET: 'true',
		SETTING_INVITES_ENABLED: 'false',
		// lower cost keeps the many registrations of the suite fast
		ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: '4',
		WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: '4',
		CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: '4',
		USER_PASSWORD_BCRYPT_SALT_ROUNDS: '4',
		LOG_LEVEL: 'warn',
		LOGS_PATH: path.join(TMP_DIR, 'logs'),
		HTTPS_CERT_PATH: path.join(TMP_DIR, 'certs', 'cert.pem'),
		HTTPS_KEY_PATH: path.join(TMP_DIR, 'certs', 'key.pem'),
		WEB_MEMORY: '1024',
		...(MULTI_TENANT
			? {
					MULTI_TENANT: 'true',
					TENANT_BASE_DOMAIN,
					TENANT_SIGNUPS_PER_HOUR: '1000',
					ADMIN_APP_URL: `http://app.${TENANT_BASE_DOMAIN}`,
					// Stripe is the suite's fake (fake-stripe.ts); webhook events are signed locally
					STRIPE_BILLING_SECRET_KEY: 'sk_test_core_e2e_offline',
					STRIPE_BILLING_WEBHOOK_SECRET: BILLING_WEBHOOK_SECRET,
					STRIPE_BILLING_API_URL: `http://${HOST}:${STRIPE_PORT}`,
					// open connections re-check their access every second (revocation specs)
					TENANT_ACCESS_RECHECK_MS: '1000',
				}
			: {}),
	};
}
