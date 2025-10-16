// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Expo app and all settings will be loaded into the client browser!

require('dotenv').config();

import { cleanEnv, num, str, bool, makeValidator, CleanOptions } from 'envalid';
import { v4 as uuid } from 'uuid';

export type Env = Readonly<{
	PRODUCTION: boolean;

	VERSION: string;

	// 'slides' | 'list'
	PRODUCTS_VIEW_TYPE: string;

	// 'popup' or 'page'
	ORDER_INFO_TYPE: string;

	API_FILE_UPLOAD_URL: string;

	INVITE_BY_CODE_LOGO: string;

	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;

	GOOGLE_MAPS_API_KEY: string;

	GOOGLE_ANALYTICS_API_KEY: string;

	FAKE_UUID: string;

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: string;

	DEFAULT_LANGUAGE: string;

	DEFAULT_LOCALE: string;

	DELIVERY_TIME_MIN: number;

	DELIVERY_TIME_MAX: number;

	SUPPORT_NUMBER: string;

	STRIPE_PUBLISHABLE_KEY: string;

	// TODO: replace logo with recent one!
	STRIPE_POP_UP_LOGO: string;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	// Graphql endpoints for apollo services
	GQL_ENDPOINT: string;

	GQL_SUBSCRIPTIONS_ENDPOINT: string;

	SERVICES_ENDPOINT: string;

	HTTPS_SERVICES_ENDPOINT: string;

	FAKE_INVITE_ID: string;

	FAKE_INVITE_CITY: string;

	FAKE_INVITE_POSTCODE: string;

	FAKE_INVITE_ADDRESS: string;

	FAKE_INVITE_HOUSE: string;

	FAKE_INVITE_CREATED_AT: string;

	FAKE_INVITE_UPDATED_AT: string;

	FAKE_INVITE_APARTMENT: string;

	FAKE_INVITE_CODE: number;

	FAKE_INVITE_COUNTRY_ID: number;

	// For maintenance micro service
	SETTINGS_APP_TYPE?: string;

	SETTINGS_MAINTENANCE_API_URL?: string;

	// For "single" merchant (multiple branches)
	MERCHANT_IDS?: string[];

	WEB_CONCURRENCY: number;

	WEB_MEMORY: number;

	PORT: number;

	SHOPPING_CART: boolean;
}>;

// TODO: validate better merchantIDs
const merchantIDs: any = makeValidator((x) => x);

const opt: CleanOptions<Env> = {};

export const env = cleanEnv(
	process.env,
	{
		PRODUCTION: bool({ default: false }),

		VERSION: str({ default: '1.0.0' }),

		// 'slides' | 'list'
		PRODUCTS_VIEW_TYPE: str({ default: 'slides' }),

		// 'popup' or 'page'
		ORDER_INFO_TYPE: str({ default: 'page' }),

		API_FILE_UPLOAD_URL: str({
			default: 'https://api.cloudinary.com/v1_1/evereq/upload',
		}),

		INVITE_BY_CODE_LOGO: str({ default: 'assets/imgs/ever-logo.svg' }),
		NO_INTERNET_LOGO: str({ default: 'assets/imgs/logo.png' }),

		COMPANY_NAME: str({ default: 'Ever Co. LTD' }),

		GOOGLE_MAPS_API_KEY: str({ default: '' }),

		GOOGLE_ANALYTICS_API_KEY: str({ default: '' }),
		FAKE_UUID: str({ default: uuid() }),

		// Not secret MixPanel Token
		MIXPANEL_API_KEY: str({ default: '' }),

		DEFAULT_LANGUAGE: str({ default: 'en-US' }),

		DEFAULT_LOCALE: str({ default: 'en-US' }),

		DELIVERY_TIME_MIN: num({ default: 30 }),
		DELIVERY_TIME_MAX: num({ default: 60 }),

		SUPPORT_NUMBER: str({ default: '0888888888' }),

		STRIPE_PUBLISHABLE_KEY: str({ default: '' }),

		// TODO: replace logo with recent one!
		STRIPE_POP_UP_LOGO: str({
			default:
				'https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2016/Jan/30/1263967991-1-everbie-avatar.png',
		}),

		MAP_MERCHANT_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon21.png',
		}),
		MAP_USER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png',
		}),
		MAP_CARRIER_ICON_LINK: str({
			default: 'http://maps.google.com/mapfiles/kml/pal4/icon54.png',
		}),

		DEFAULT_LATITUDE: num({ default: 42.6459136 }),
		DEFAULT_LONGITUDE: num({ default: 23.3332736 }),

		// Graphql endpoints for apollo services
		GQL_ENDPOINT: str({ default: 'http://localhost:8443/graphql' }),
		GQL_SUBSCRIPTIONS_ENDPOINT: str({
			default: 'ws://localhost:2086/subscriptions',
		}),
		SERVICES_ENDPOINT: str({ default: 'http://localhost:5500' }),
		HTTPS_SERVICES_ENDPOINT: str({ default: 'https://localhost:2087' }),

		FAKE_INVITE_ID: str({ default: '1ae9d04f9010d834f8906881' }),
		FAKE_INVITE_CITY: str({ default: 'Sofia' }),
		FAKE_INVITE_POSTCODE: str({ default: '1700' }),
		FAKE_INVITE_ADDRESS: str({ default: 'Simeonovsko shose' }),
		FAKE_INVITE_HOUSE: str({ default: '104' }),
		FAKE_INVITE_CREATED_AT: str({ default: '2018-05-02T14:50:55.658Z' }),
		FAKE_INVITE_UPDATED_AT: str({ default: '2018-05-02T14:50:55.658Z' }),
		FAKE_INVITE_APARTMENT: str({ default: '3' }),
		FAKE_INVITE_CODE: num({ default: 8321 }),
		FAKE_INVITE_COUNTRY_ID: num({ default: 21 }),

		// For maintenance micro service. Ever maintenance API URL: https://maintenance.ever.co/status
		SETTINGS_APP_TYPE: str({ default: 'shop-mobile' }),
		SETTINGS_MAINTENANCE_API_URL: str({
			default: '',
		}),

		// For "single" merchant (multiple branches)
		MERCHANT_IDS: merchantIDs({
			default: [
				// Add existing merchant ids
			],
		}),
		WEB_CONCURRENCY: num({ default: 1 }),
		WEB_MEMORY: num({ default: 2048 }),
		PORT: num({ default: 4201 }),
		SHOPPING_CART: bool({ default: false }),
	},
	opt,
);
