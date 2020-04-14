// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env } from './env';
import { writeFile, unlinkSync } from 'fs';
import { argv } from 'yargs';

const environment = argv.environment;
const isProd = environment === 'prod';

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

if (!env.STRIPE_PUBLISHABLE_KEY) {
	console.warn(
		'WARNING: No Stripe Publishable Key defined in the .env. Stripe payments may not be available!'
	);
}

const envFileContent = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';

export const environment: Environment = {
  production: ${isProd},

  VERSION: '${env.VERSION}',

  // 'slides' | 'list'
  PRODUCTS_VIEW_TYPE: '${env.PRODUCTS_VIEW_TYPE}',

  // 'popup' or 'page'
  ORDER_INFO_TYPE: '${env.ORDER_INFO_TYPE}',

  API_FILE_UPLOAD_URL: '${env.API_FILE_UPLOAD_URL}',

  INVITE_BY_CODE_LOGO: '${env.INVITE_BY_CODE_LOGO}',
  NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',

  COMPANY_NAME: '${env.COMPANY_NAME}',

  GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

  GOOGLE_ANALYTICS_API_KEY: '${env.GOOGLE_ANALYTICS_API_KEY}',

  FAKE_UUID: '${env.FAKE_UUID}',

  // Not secret MixPanel Token
  MIXPANEL_API_KEY: '${env.MIXPANEL_API_KEY}',

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',
  DEFAULT_LOCALE: '${env.DEFAULT_LOCALE}',

  DELIVERY_TIME_MIN: ${env.DELIVERY_TIME_MIN},
  DELIVERY_TIME_MAX: ${env.DELIVERY_TIME_MAX},

  SUPPORT_NUMBER: '${env.SUPPORT_NUMBER}',

  STRIPE_PUBLISHABLE_KEY: '${env.STRIPE_PUBLISHABLE_KEY}',

  STRIPE_POP_UP_LOGO: '${env.STRIPE_POP_UP_LOGO}',

  MAP_MERCHANT_ICON_LINK: '${env.MAP_MERCHANT_ICON_LINK}',

  MAP_USER_ICON_LINK: '${env.MAP_USER_ICON_LINK}',

  MAP_CARRIER_ICON_LINK: '${env.MAP_CARRIER_ICON_LINK}',

  DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

  GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
  GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',
  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',

  FAKE_INVITE: {
    ID: '${env.FAKE_INVITE_ID}',
	  CITY: '${env.FAKE_INVITE_CITY}',
	  POSTCODE: '${env.FAKE_INVITE_POSTCODE}',
	  ADDRESS: '${env.FAKE_INVITE_ADDRESS}',
	  HOUSE: '${env.FAKE_INVITE_HOUSE}',
	  CREATED_AT: '${env.FAKE_INVITE_CREATED_AT}',
	  UPDATED_AT: '${env.FAKE_INVITE_UPDATED_AT}',
	  APARTMENT: '${env.FAKE_INVITE_APARTMENT}',
	  CODE: ${env.FAKE_INVITE_CODE},
	  COUNTRY_ID: ${env.FAKE_INVITE_COUNTRY_ID}
  },

  // For maintenance micro service
  SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
  SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}',

  // For "single" merchant (multiple branches)
  MERCHANT_IDS: ${
		env.MERCHANT_IDS && env.MERCHANT_IDS.length > 0
			? env.MERCHANT_IDS
			: JSON.stringify([])
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * 'zone.run', 'zoneDelegate.invokeTask' for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

`;

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther: string = !isProd
	? 'environment.prod.ts'
	: 'environment.ts';

// we always want first to remove old generated files (one of them is not needed for current build)
try {
	unlinkSync(`./src/environments/environment.ts`);
} catch {}
try {
	unlinkSync(`./src/environments/environment.prod.ts`);
} catch {}

writeFile(`./src/environments/${envFileDest}`, envFileContent, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log(`Generated Angular environment file: ${envFileDest}`);
	}
});

writeFile(`./src/environments/${envFileDestOther}`, envFileContent, function (
	err
) {
	if (err) {
		console.log(err);
	} else {
		console.log(`Generated Second environment file: ${envFileDestOther}`);
	}
});
