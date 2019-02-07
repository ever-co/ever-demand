// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { cleanEnv, num, str, bool } from 'envalid';

export type Env = Readonly<{
	production: boolean;
	SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;

	GOOGLE_MAPS_API_KEY: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	API_FILE_UPLOAD_URL: string;

	COMPANY_NAME: string;
	COMPANY_SITE_LINK: string;
	COMPANY_GITHUB_LINK: string;
	COMPANY_FACEBOOK_LINK: string;
	COMPANY_TWITTER_LINK: string;
	COMPANY_LINKEDIN_LINK: string;

	GENERATE_PASSWORD_CHARSET: string;

	CURRENCY_SYMBOL: string;

	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
}>;

export const env: Env = cleanEnv(
	process.env,
	{
		production: bool({ default: false }),

		SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
		GQL_ENDPOINT: str({ default: 'http://localhost:5555/graphql' }),
		GQL_SUBSCRIPTIONS_ENDPOINT: str({
			default: 'ws://localhost:5050/subscriptions'
		}),

		GOOGLE_MAPS_API_KEY: str({ default: '' }),

		DEFAULT_LATITUDE: num({ default: 42.6459136 }),
		DEFAULT_LONGITUDE: num({ default: 23.3332736 }),

		MAP_MERCHANT_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon21.png'
		}),

		MAP_USER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png'
		}),

		MAP_CARRIER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal4/icon54.png'
		}),

		API_FILE_UPLOAD_URL: str({
			default: 'https://api.cloudinary.com/v1_1/evereq/upload'
		}),

		COMPANY_NAME: str({ default: 'Ever Co. LTD' }),
		COMPANY_SITE_LINK: str({ default: 'https://ever.co/' }),
		COMPANY_GITHUB_LINK: str({ default: 'https://github.com/ever-co' }),
		COMPANY_FACEBOOK_LINK: str({
			default: 'https://www.facebook.com/evercoapp'
		}),
		COMPANY_TWITTER_LINK: str({ default: 'https://twitter.com/evercoapp' }),
		COMPANY_LINKEDIN_LINK: str({
			default: 'https://www.linkedin.com/company/ever-co.'
		}),

		GENERATE_PASSWORD_CHARSET: str({
			default:
				'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_'
		}),

		CURRENCY_SYMBOL: str({ default: '$' }),

		SETTINGS_APP_TYPE: str({ default: 'admin' }),
		SETTINGS_MAINTENANCE_API_URL: str({
			default: 'https://maintenance.ever.co/status'
		})
	},
	{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
