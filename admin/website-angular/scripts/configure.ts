// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!

import { env } from './env';
import { writeFile } from 'fs';
import { argv } from 'yargs';

const environment = argv.environment;
const isProd = environment === 'prod';

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

const envFileContent = `import { Environment } from './model';

export const environment: Environment = {
  production: ${isProd},

  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
  GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',

  GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

  DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

  MAP_MERCHANT_ICON_LINK: '${env.MAP_MERCHANT_ICON_LINK}',

  MAP_USER_ICON_LINK: '${env.MAP_USER_ICON_LINK}',

  MAP_CARRIER_ICON_LINK: '${env.MAP_CARRIER_ICON_LINK}',

  API_FILE_UPLOAD_URL: '${env.API_FILE_UPLOAD_URL}',

  COMPANY_NAME: '${env.COMPANY_NAME}',
  COMPANY_SITE_LINK: '${env.COMPANY_SITE_LINK}',
  COMPANY_GITHUB_LINK: '${env.COMPANY_GITHUB_LINK}',
  COMPANY_FACEBOOK_LINK: '${env.COMPANY_FACEBOOK_LINK}',
  COMPANY_TWITTER_LINK: '${env.COMPANY_TWITTER_LINK}',
  COMPANY_LINKEDIN_LINK: '${env.COMPANY_LINKEDIN_LINK}',

  GENERATE_PASSWORD_CHARSET: '${env.GENERATE_PASSWORD_CHARSET}',

  CURRENCY_SYMBOL: '${env.CURRENCY_SYMBOL}',

  // For maintenance micro service. Ever maintanance API URL: https://maintenance.ever.co/status
  SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
  SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}'
};
`;

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';

writeFile(`./src/environments/${envFileDest}`, envFileContent, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log(`Generated Angular environment file: ${envFileDest}`);
	}
});
