require('dotenv').config({ quiet: true });

import {
	cleanEnv,
	num,
	port,
	str,
	ValidatorSpec,
	bool,
	makeValidator,
} from 'envalid';
import {
	DEFAULT_STRIPE_CURRENCY,
	resolveStripeCurrency,
} from './services/orders/stripeCurrency';

// Checked at boot: an invalid currency stops the server with a clear message
// instead of failing every card payment.
const stripeCurrency = makeValidator<string>(resolveStripeCurrency);

export type Environments = 'production' | 'development' | 'test';

export type Env = Readonly<{
	isDev: boolean;
	isTest: boolean;
	isProd: boolean;

	NODE_ENV: Environments;

	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;

	EXPRESS_SESSION_SECRET: string;

	API_HOST: string;
	HTTPSPORT: number;
	HTTPPORT: number;
	GQLPORT: number;
	GQLPORT_SUBSCRIPTIONS: number;

	HTTPS_CERT_PATH: string;
	HTTPS_KEY_PATH: string;

	LOGS_PATH: string;

	DB_URI: string;
	TESTING_DB_URI: string;

	STRIPE_SECRET_KEY: string;
	STRIPE_CURRENCY: string;

	URBAN_AIRSHIP_KEY: string;
	URBAN_AIRSHIP_SECRET: string;

	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;

	KEYMETRICS_MACHINE_NAME: string;
	KEYMETRICS_SECRET_KEY: string;
	KEYMETRICS_PUBLIC_KEY: string;

	GOOGLE_APP_ID: string;
	GOOGLE_APP_SECRET: string;

	FACEBOOK_APP_ID: string;
	FACEBOOK_APP_SECRET: string;

	JWT_SECRET: string;

	ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: number;
	USER_PASSWORD_BCRYPT_SALT_ROUNDS: number;

	SETTING_INVITES_ENABLED?: boolean;
	SETTINGS_REGISTRATIONS_REQUIRED_ON_START?: boolean;
	ADMIN_EMAIL: string;
	ADMIN_PASSWORD: string;
	ADMIN_PASSWORD_RESET?: boolean;
	FAKE_DATA_GENERATOR?: boolean;

	FAKE_INVITE_CODE: number;

	ARCGIS_CLIENT_ID: string;
	ARCGIS_CLIENT_SECRET: string;
	IP_STACK_API_KEY?: string;

	LOG_LEVEL?: string;

	ENGINE_API_KEY?: string;

	MAX_SOCKETS?: number;
}>;

const cleaned = cleanEnv(
	process.env,
	{
		NODE_ENV: str({
			choices: ['production', 'development', 'test'],
			default: 'development',
		}) as ValidatorSpec<Env['NODE_ENV']>,

		WEB_CONCURRENCY: num({ default: 1 }),
		WEB_MEMORY: num({ default: 2048 }),

		API_HOST: str({ default: '127.0.0.1'}),
		HTTPSPORT: port({ default: 2087 }),
		HTTPPORT: port({ default: 5500 }),
		GQLPORT: port({ default: 8443 }),
		GQLPORT_SUBSCRIPTIONS: port({ default: 2086 }),

		HTTPS_CERT_PATH: str({ default: 'certificates/https/cert.pem' }),
		HTTPS_KEY_PATH: str({ default: 'certificates/https/key.pem' }),

		LOGS_PATH: str({ default: './tmp/logs' }),

		DB_URI: str({ default: 'mongodb://localhost/ever_development' }),
		TESTING_DB_URI: str({ default: 'mongodb://localhost/ever_testing' }),

		STRIPE_SECRET_KEY: str({ default: '' }),
		STRIPE_CURRENCY: stripeCurrency({
			desc: 'Three-letter currency code of card charges, e.g. usd (unset or blank = ils). Currencies without 100 minor units, such as jpy, are refused. Change it only while no card payment is in progress. Set a currency other than ils only once every shop in use, installed apps too, loads it from the server: an older shop still shows ILS in its card popup.',
			default: DEFAULT_STRIPE_CURRENCY,
		}),

		URBAN_AIRSHIP_KEY: str({ default: '' }),
		URBAN_AIRSHIP_SECRET: str({ default: '' }),

		AWS_ACCESS_KEY_ID: str({ default: '' }),
		AWS_SECRET_ACCESS_KEY: str({ default: '' }),

		KEYMETRICS_MACHINE_NAME: str({ default: '' }),
		KEYMETRICS_SECRET_KEY: str({ default: '' }),
		KEYMETRICS_PUBLIC_KEY: str({ default: '' }),

		GOOGLE_APP_ID: str({ default: '' }),
		GOOGLE_APP_SECRET: str({ default: '' }),

		FACEBOOK_APP_ID: str({ default: '' }),
		FACEBOOK_APP_SECRET: str({ default: '' }),

		EXPRESS_SESSION_SECRET: str({ default: '' }),
		JWT_SECRET: str({ default: '' }),

		ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
			default: 12,
		}),

		WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
			default: 12,
		}),

		CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
			default: 12,
		}),

		USER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 10',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt',
			default: 10,
		}),

		SETTING_INVITES_ENABLED: bool({ default: false }),
		SETTINGS_REGISTRATIONS_REQUIRED_ON_START: bool({ default: false }),
		ADMIN_EMAIL: str({
			desc: 'Email of the first admin, created on first boot when no admin with it exists',
			default: 'admin@ever.co',
		}),
		ADMIN_PASSWORD: str({
			desc: 'Password of the first admin. Required in production (unless DEMO=true); outside production it defaults to "admin"',
			default: '',
		}),
		ADMIN_PASSWORD_RESET: bool({ default: false }),
		FAKE_DATA_GENERATOR: bool({ default: false }),

		FAKE_INVITE_CODE: num({ default: 0 }),

		ARCGIS_CLIENT_ID: str({ default: '' }),
		ARCGIS_CLIENT_SECRET: str({ default: '' }),
		IP_STACK_API_KEY: str({ default: '' }),

		LOG_LEVEL: str({
			choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
			default: 'error',
		}),

		ENGINE_API_KEY: str({
			desc:
				'Apollo Engine Key (optional, see https://www.apollographql.com/docs/platform/schema-registry)',
			default: '',
		}),

		MAX_SOCKETS: num({ default: Infinity }),
	}
);

/** Placeholder or well-known values that must never sign tokens or sessions in production. */
export const WEAK_SECRETS: ReadonlySet<string> = new Set([
	'',
	'secretKey',
	'demand',
	'default',
	'secret',
	'changeme',
]);

// Development-only fallbacks: production refuses to start without real values (see assertProductionSecrets).
const DEV_JWT_SECRET = 'ever-demand-dev-jwt-secret';
const DEV_SESSION_SECRET = 'ever-demand-dev-session-secret';

const isProd = cleaned.NODE_ENV === 'production';

/**
 * Validated environment. `isProd`, `isDev` and `isTest` derive from NODE_ENV (they used to be read
 * from literal `isProd`/`isDev`/`isTest` env vars, so production ran with GraphQL debug on).
 */
export const env: Env = Object.freeze({
	...cleaned,
	isProd,
	isDev: cleaned.NODE_ENV === 'development',
	isTest: cleaned.NODE_ENV === 'test',
	JWT_SECRET: cleaned.JWT_SECRET || (isProd ? '' : DEV_JWT_SECRET),
	EXPRESS_SESSION_SECRET:
		cleaned.EXPRESS_SESSION_SECRET || (isProd ? '' : DEV_SESSION_SECRET),
}) as Env;

/**
 * Throws when production would run with a missing or well-known JWT or session secret: anyone could
 * then forge login tokens. Called once at boot (main.ts).
 */
export function assertProductionSecrets(e: Env = env): void {
	if (!e.isProd) return;
	const weak = (['JWT_SECRET', 'EXPRESS_SESSION_SECRET'] as const).filter(
		(name) => WEAK_SECRETS.has(e[name])
	);
	if (weak.length) {
		throw new Error(
			`Refusing to start in production: set ${weak.join(' and ')} to long random values (env vars, e.g. from OpenBao or GitHub secrets).`
		);
	}
}
