// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool, makeValidator } from 'envalid';
import { v4 as uuid } from 'uuid';

export type Env = Readonly<{
	production: boolean;

	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;

	// Graphql endpoints for apollo services
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;

	APP_VERSION: string;

	API_FILE_UPLOAD_URL: string;

	DEFAULT_LOGIN_USERNAME: string;
	DEFAULT_LOGIN_PASSWORD: string;

	LOGIN_LOGO: string;
	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;
	APP_NAME: string;

	GOOGLE_MAPS_API_KEY: string;

	GOOGLE_ANALYTICS_API_KEY: string;
	FAKE_UUID: string;
	MIXPANEL_API_KEY: string;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	DEFAULT_LANGUAGE: string;

	// For maintenance micro service
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	WEB_CONCURRENCY: number;
	WEB_MEMORY: number;
	PORT: number;

	MERCADO_PAYMENT: string;
}>;

export const env: Env = cleanEnv(
	process.env,
	{
		production: bool({ default: false }),

		SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
		HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:5501' }),

		// Graphql endpoints for apollo services
		GQL_ENDPOINT: str({ default: 'http://localhost:5555/graphql' }),
		GQL_SUBSCRIPTIONS_ENDPOINT: str({
			default: 'ws://localhost:5050/subscriptions',
		}),

		APP_VERSION: str({ default: '0.2.0' }),

		API_FILE_UPLOAD_URL: str({
			default: 'https://api.cloudinary.com/v1_1/evereq/upload',
		}),

		DEFAULT_LOGIN_USERNAME: str({ default: 'hut_pizza' }),
		DEFAULT_LOGIN_PASSWORD: str({ default: '123456' }),

		LOGIN_LOGO: str({ default: 'assets/imgs/ever-logo.svg' }),
		NO_INTERNET_LOGO: str({ default: 'assets/imgs/logo.png' }),

		COMPANY_NAME: str({ default: 'Ever Co. LTD' }),
		APP_NAME: str({ default: 'Ever Merchant' }),
		GOOGLE_MAPS_API_KEY: str({ default: '' }),
		GOOGLE_ANALYTICS_API_KEY: str({ default: '' }),
		FAKE_UUID: str({ default: uuid() }),
		MIXPANEL_API_KEY: str({ default: '' }),

		MAP_MERCHANT_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon21.png',
		}),
		MAP_USER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png',
		}),
		MAP_CARRIER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal4/icon54.png',
		}),

		// For maintenance micro service. Ever maintanance API URL: https://maintenance.ever.co/status
		SETTINGS_APP_TYPE: str({ default: 'merchant-tablet' }),
		SETTINGS_MAINTENANCE_API_URL: str({
			default: '',
		}),
		DEFAULT_LANGUAGE: str({ default: 'en-US' }),
		WEB_CONCURRENCY: num({ default: 1 }),
		WEB_MEMORY: num({ default: 2048 }),
		PORT: num({ default: 4202 }),

		MERCADO_PAYMENT: str({ default: '' }),
	},
	{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
