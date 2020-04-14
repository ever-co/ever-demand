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

const envFileContentDev = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { ApplicationRef, NgModuleRef } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

Error.stackTraceLimit = Infinity;

// tslint:disable-next-line:no-var-requires
require('zone.js/dist/long-stack-trace-zone');

export const environment: Environment = {
  production: ${isProd},

  DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',

  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
  GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
  GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',
  AUTH_LOGO: '${env.AUTH_LOGO}',
  NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',

  GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

  DELIVERY_TIME_MIN: ${env.DELIVERY_TIME_MIN},
  DELIVERY_TIME_MAX: ${env.DELIVERY_TIME_MAX},

  // For maintenance micro service. Ever maintanance API URL: https://maintenance.ever.co/status
  SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
  SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}',

  ENV_PROVIDERS: [],

  /**
	* Angular debug tools in the dev console
	* https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	* @param modRef
	* @return {any}
	*/
	decorateModuleRef(modRef: NgModuleRef<any>) {
		const appRef = modRef.injector.get(ApplicationRef);
		const cmpRef = appRef.components[0];

		const _ng = (window as any).ng;
		enableDebugTools(cmpRef);
		(window as any).ng.probe = _ng.probe;
		(window as any).ng.coreTokens = _ng.coreTokens;
		return modRef;
	}

};
`;

const envFileContentProd = `// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { enableProdMode, NgModuleRef } from '@angular/core';
import { disableDebugTools } from '@angular/platform-browser';
import { Environment } from './model';

enableProdMode();

export const environment: Environment = {
  production: ${isProd},

  DEFAULT_LATITUDE: ${env.DEFAULT_LATITUDE},
  DEFAULT_LONGITUDE: ${env.DEFAULT_LONGITUDE},

  DEFAULT_LANGUAGE: '${env.DEFAULT_LANGUAGE}',

  SERVICES_ENDPOINT: '${env.SERVICES_ENDPOINT}',
  HTTPS_SERVICES_ENDPOINT: '${env.HTTPS_SERVICES_ENDPOINT}',
  GQL_ENDPOINT: '${env.GQL_ENDPOINT}',
  GQL_SUBSCRIPTIONS_ENDPOINT: '${env.GQL_SUBSCRIPTIONS_ENDPOINT}',
  AUTH_LOGO: '${env.AUTH_LOGO}',
  NO_INTERNET_LOGO: '${env.NO_INTERNET_LOGO}',
  GOOGLE_MAPS_API_KEY: '${env.GOOGLE_MAPS_API_KEY}',

  DELIVERY_TIME_MIN: ${env.DELIVERY_TIME_MIN},
  DELIVERY_TIME_MAX: ${env.DELIVERY_TIME_MAX},

  // For maintenance micro service. Ever maintanance API URL: https://maintenance.ever.co/status
  SETTINGS_APP_TYPE: '${env.SETTINGS_APP_TYPE}',
  SETTINGS_MAINTENANCE_API_URL: '${env.SETTINGS_MAINTENANCE_API_URL}',

  ENV_PROVIDERS: [],

  /**
	* Angular debug tools in the dev console
	* https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
	* @param modRef
	* @return {any}
	*/
	decorateModuleRef(modRef: NgModuleRef<any>) {
		disableDebugTools();
		return modRef;
	}

};
`;

// we always want first to remove old generated files (one of them is not needed for current build)
try {
	unlinkSync(`./src/environments/environment.ts`);
} catch {}
try {
	unlinkSync(`./src/environments/environment.prod.ts`);
} catch {}

const envFileDest: string = isProd ? 'environment.prod.ts' : 'environment.ts';
const envFileDestOther: string = !isProd
	? 'environment.prod.ts'
	: 'environment.ts';

writeFile(`./src/environments/${envFileDest}`, envFileContentProd, function (
	err
) {
	if (err) {
		console.log(err);
	} else {
		console.log(`Generated Angular environment file: ${envFileDest}`);
	}
});

writeFile(
	`./src/environments/${envFileDestOther}`,
	envFileContentDev,
	function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log(
				`Generated Angular environment file: ${envFileDestOther}`
			);
		}
	}
);
