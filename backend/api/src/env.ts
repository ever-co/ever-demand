import { cleanEnv, num, port, str, ValidatorSpec, bool } from 'envalid';

export type Env = Readonly<{
	isDev: boolean;
	isTest: boolean;
	isProd: boolean;

	NODE_ENV: 'production' | 'development' | 'test';

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
}>;

export const env: Env = cleanEnv(
	process.env,
	{
		NODE_ENV: str({
			choices: ['production', 'development', 'test'],
			default: 'development'
		}) as ValidatorSpec<Env['NODE_ENV']>,

		WEB_CONCURRENCY: num({ default: 1 }),
		WEB_MEMORY: num({ default: 2048 }),

		HTTPSPORT: port(),
		HTTPPORT: port(),
		GQLPORT: port(),
		GQLPORT_SUBSCRIPTIONS: port(),

		HTTPS_CERT_PATH: str(),
		HTTPS_KEY_PATH: str(),

		LOGS_PATH: str(),

		DB_URI: str(),
		TESTING_DB_URI: str(),

		STRIPE_SECRET_KEY: str(),

		URBAN_AIRSHIP_KEY: str(),
		URBAN_AIRSHIP_SECRET: str(),

		AWS_ACCESS_KEY_ID: str(),
		AWS_SECRET_ACCESS_KEY: str(),

		KEYMETRICS_MACHINE_NAME: str(),
		KEYMETRICS_SECRET_KEY: str(),
		KEYMETRICS_PUBLIC_KEY: str(),

		GOOGLE_APP_ID: str(),
		GOOGLE_APP_SECRET: str(),

		FACEBOOK_APP_ID: str(),
		FACEBOOK_APP_SECRET: str(),

		JWT_SECRET: str(),

		ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt'
		}),

		WAREHOUSE_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt'
		}),

		CARRIER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 12',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt'
		}),

		USER_PASSWORD_BCRYPT_SALT_ROUNDS: num({
			desc: 'Used for passwords encryption, recommended value: 10',
			docs:
				'https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt'
		}),

		SETTING_INVITES_ENABLED: bool({ default: false }),
		SETTINGS_REGISTRATIONS_REQUIRED_ON_START: bool({ default: false }),

		FAKE_INVITE_CODE: num({ default: 0 }),

		ARCGIS_CLIENT_ID: str(),
		ARCGIS_CLIENT_SECRET: str(),
		IP_STACK_API_KEY: str({ default: '' }),
		LOG_LEVEL: str({
			choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
			default: 'error'
		})
	},
	{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
