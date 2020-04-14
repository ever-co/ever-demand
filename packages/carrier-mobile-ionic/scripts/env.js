'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var envalid_1 = require('envalid');
var uuid_1 = require('uuid');
exports.env = envalid_1.cleanEnv(
	process.env,
	{
		production: envalid_1.bool({ default: false }),
		APP_VERSION: envalid_1.str({ default: '0.2.0' }),
		DEFAULT_CUSTOMER_LOGO: envalid_1.str({
			default:
				'http://res.cloudinary.com/evereq/image/upload/v1536843011/everbie-products-images/btzn3o8pimhercepno2d.png',
		}),
		LOGIN_LOGO: envalid_1.str({ default: 'assets/imgs/ever-logo.svg' }),
		NO_INTERNET_LOGO: envalid_1.str({
			default: 'assets/imgs/ever-logo.svg',
		}),
		COMPANY_NAME: envalid_1.str({ default: 'Ever Co. LTD' }),
		APP_NAME: envalid_1.str({ default: 'Ever® Carrier' }),
		DEFAULT_LOGIN_USERNAME: envalid_1.str({ default: 'ever' }),
		DEFAULT_LOGIN_PASSWORD: envalid_1.str({ default: 'changeme' }),
		GOOGLE_MAPS_API_KEY: envalid_1.str({ default: '' }),
		GOOGLE_ANALYTICS_API_KEY: envalid_1.str({ default: '' }),
		FAKE_UUID: envalid_1.str({ default: uuid_1.v4() }),
		MIXPANEL_API_KEY: envalid_1.str({ default: '' }),
		DEFAULT_LATITUDE: envalid_1.num({ default: 42.6459136 }),
		DEFAULT_LONGITUDE: envalid_1.num({ default: 23.3932736 }),
		DEFAULT_LANGUAGE: envalid_1.str({ default: 'en' }),
		GQL_ENDPOINT: envalid_1.str({
			default: 'http://localhost:5555/graphql',
		}),
		GQL_SUBSCRIPTIONS_ENDPOINT: envalid_1.str({
			default: 'ws://localhost:5050/subscriptions',
		}),
		SERVICES_ENDPOINT: envalid_1.str({ default: 'http://localhost:5500' }),
		HTTPS_SERVICES_ENDPOINT: envalid_1.str({
			default: 'https://localhost:5501',
		}),
		SETTINGS_APP_TYPE: envalid_1.str({ default: 'carrier-mobile' }),
		SETTINGS_MAINTENANCE_API_URL: envalid_1.str({
			default: '',
		}),
		WEB_CONCURRENCY: envalid_1.num({ default: 1 }),
		WEB_MEMORY: envalid_1.num({ default: 2048 }),
		PORT: envalid_1.num({ default: 4203 }),
	},
	{ strict: true, dotEnvPath: __dirname + '/../.env' }
);
//# sourceMappingURL=env.js.map
