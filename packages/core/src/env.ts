import { cleanEnv, num, port, str, ValidatorSpec, bool } from 'envalid';

export type Environments = 'production' | 'development' | 'test';

export type Env = Readonly<{
	isDev: boolean;
	isTest: boolean;
	isProd: boolean;

	NODE_ENV: Environments;

	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;

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

	FAKE_INVITE_CODE: number;

	ARCGIS_CLIENT_ID: string;
	ARCGIS_CLIENT_SECRET: string;
	IP_STACK_API_KEY?: string;

	LOG_LEVEL?: string;

	ENGINE_API_KEY?: string;

	MAX_SOCKETS?: number;
}>;

export const env: Env = cleanEnv(
	process.env,
	{
		NODE_ENV: str({
			choices: ['production', 'development', 'test'],
			default: 'development',
		}) as ValidatorSpec<Env['NODE_ENV']>,

		WEB_CONCURRENCY: num({ default: 1 }),
		WEB_MEMORY: num({ default: 2048 }),

		HTTPSPORT: port({ default: 5501 }),
		HTTPPORT: port({ default: 5500 }),
		GQLPORT: port({ default: 5555 }),
		GQLPORT_SUBSCRIPTIONS: port({ default: 5050 }),

		HTTPS_CERT_PATH: str({ default: 'certificates/https/cert.pem' }),
		HTTPS_KEY_PATH: str({ default: 'certificates/https/key.pem' }),

		LOGS_PATH: str({ default: './tmp/logs' }),

		DB_URI: str({ default: 'mongodb://localhost/ever_development' }),
		TESTING_DB_URI: str({ default: 'mongodb://localhost/ever_testing' }),

		STRIPE_SECRET_KEY: str({ default: '' }),

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

		JWT_SECRET: str({ default: 'default' }),

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
	},
	{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
