// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Expo app and all settings will be loaded into the client browser!

import { writeFile, unlinkSync } from 'fs';
import { env } from './env';
import { argv } from 'yargs';
import { production } from '../package.json';

const isProd: boolean = argv.environment === 'prod' || production;

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!',
	);
}

if (!env.STRIPE_PUBLISHABLE_KEY) {
	console.warn(
		'WARNING: No Stripe Publishable Key defined in the .env. Stripe payments may not be available!',
	);
}

const envFileContent = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import type Environment from './model';

const environment: Environment = {
	// TODO: Add more descriptive comments.
	/**
	 * App default environment
	 *
	 * @type boolean
	 */
	PRODUCTION: false,

	/**
	 * App version
	 *
	 * @type string
	 */
	VERSION: '1.0.0',

	/**
	 * @type 'slides' | 'list'
	 */
	PRODUCTS_VIEW_TYPE: 'slides',

	/**
	 * Order info behavior type
	 *
	 * @type 'popup' | 'page'
	 */
	ORDER_INFO_TYPE: 'page',

	COMPANY_NAME: 'Ever Co. LTD',

	/**
	 * Contain images url
	 */
	IMAGE_URL: {
		INVITE_BY_CODE_LOGO: 'assets/imgs/ever-logo.svg',
		NO_INTERNET_LOGO: 'assets/imgs/logo.png',
		MAP_MERCHANT_ICON:
			'http://maps.google.com/mapfiles/kml/pal3/icon21.png',
		MAP_USER_ICON: 'http://maps.google.com/mapfiles/kml/pal3/icon48.png',
		MAP_CARRIER_ICON: 'http://maps.google.com/mapfiles/kml/pal4/icon54.png',
	},

	GOOGLE: {
		MAPS_API_KEY: '',
		ANALYTICS_API_KEY: '',
	},

	FAKE_UUID: 'ceffd77c-8cc1-47ac-b9b8-889f057aba3d',

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: '',

	LANGUAGE: {
		LANG: 'ENGLISH',
		LOCALE: 'ENGLISH',
	},

	DELIVERY_TIME: {
		MIN: 30,
		MAX: 60,
	},

	SUPPORT_NUMBER: '0888888888',

	STRIP: {
		PUBLISHABLE_KEY: '',
		POP_UP_LOGO:
			'https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2016/Jan/30/1263967991-1-everbie-avatar.png',
	},

	COORDINATE: {
		LATITUDE: 42.6459136,
		LONGITUDE: 23.3332736,
	},

	/**
	 * Contain app endpoints
	 *
	 * _🚧 warning: if you're using a AVD (Android Virtual Device)_
	 * _and localhost doesn't works, replace it with **10.0.2.2**_
	 */
	ENDPOINT: {
		GQL: 'http://localhost:8443/graphql',
		GQL_SUBSCRIPTIONS: 'ws://localhost:2086/subscriptions',
		SERVICES: 'http://localhost:5500',
		HTTPS_SERVICES: 'https://localhost:2087',
		API_FILE_UPLOAD: 'https://api.cloudinary.com/v1_1/evereq/upload',
	},

	FAKE_INVITE: {
		ID: '1ae9d04f9010d834f8906881',
		CITY: 'Sofia',
		POSTCODE: '1700',
		ADDRESS: 'Simeonovsko shose',
		HOUSE: '104',
		CREATED_AT: '2018-05-02T14:50:55.658Z',
		UPDATED_AT: '2018-05-02T14:50:55.658Z',
		APARTMENT: '3',
		CODE: 8321,
		COUNTRY_ID: 21,
	},

	/**
	 * For maintenance micro service
	 */
	SETTINGS: {
		APP_TYPE: 'shop-mobile',
		MAINTENANCE_API_URL: '',
	},

	/**
	 * For "single" merchant (multiple branches)
	 */
	MERCHANT_IDS: [],

	SHOPPING_CART: false,
};

export default environment;

/*
 * In development mode, to ignore zone related error stack frames such as
 * 'zone.run', 'zoneDelegate.invokeTask' for easier debugging, you can
 * import the following file, but please comment it out in isProd mode
 * because it will have performance impact when throw error
 */
`;

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther: string = !isProd
	? 'environment.prod.ts'
	: 'environment.ts';

// we always want first to remove old generated files (one of them is not needed for current build)
try {
	unlinkSync('./src/environments/environment.ts');
} catch {}
try {
	unlinkSync('./src/environments/environment.prod.ts');
} catch {}

writeFile(`./src/environments/${envFileDest}`, envFileContent, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log(`Generated ts environment file: ${envFileDest}`);
	}
});

writeFile(
	`./src/environments/${envFileDestOther}`,
	envFileContent,
	function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log(
				`Generated Second environment file: ${envFileDestOther}`,
			);
		}
	},
);
