// Renders `src/environments/environment(.prod).ts` from the validated env (see ./env.ts).
// Kept free of side effects so `node --test scripts` can check it.

import type { Env } from './env.ts';

/** Keys written to the Angular environment, in output order. */
const STRING_KEYS = [
	'SERVICES_ENDPOINT',
	'HTTPS_SERVICES_ENDPOINT',
	'GQL_ENDPOINT',
	'GQL_SUBSCRIPTIONS_ENDPOINT',
	'GOOGLE_MAPS_API_KEY',
	'NO_INTERNET_LOGO',
	'MAP_MERCHANT_ICON_LINK',
	'MAP_USER_ICON_LINK',
	'MAP_CARRIER_ICON_LINK',
	'API_FILE_UPLOAD_URL',
	'COMPANY_NAME',
	'COMPANY_SITE_LINK',
	'COMPANY_GITHUB_LINK',
	'COMPANY_FACEBOOK_LINK',
	'COMPANY_TWITTER_LINK',
	'COMPANY_LINKEDIN_LINK',
	'GENERATE_PASSWORD_CHARSET',
	'CURRENCY_SYMBOL',
	'DEFAULT_LANGUAGE',
	// For maintenance micro service. Ever maintenance API URL: https://maintenance.ever.co/status
	'SETTINGS_APP_TYPE',
	'SETTINGS_MAINTENANCE_API_URL',
] as const;

const NUMBER_KEYS = ['DEFAULT_LATITUDE', 'DEFAULT_LONGITUDE'] as const;

export interface RenderOptions {
	isProd: boolean;
	/**
	 * In Docker the image is built once and configured at start: string values become
	 * `DOCKER_<KEY>` placeholders that `.deploy/admin-web-angular/entrypoint.*.sh` replaces with
	 * `sed` in the built JS.
	 */
	isDocker: boolean;
}

export function renderEnvironment(
	env: Env,
	{ isProd, isDocker }: RenderOptions,
): string {
	const lines: string[] = [`\tproduction: ${isProd},`];

	for (const key of STRING_KEYS) {
		const value = isDocker ? `DOCKER_${key}` : String(env[key] ?? '');
		lines.push(`\t${key}: ${JSON.stringify(value)},`);
	}
	for (const key of NUMBER_KEYS) {
		lines.push(`\t${key}: ${Number(env[key])},`);
	}

	return `// NOTE: Auto-generated file by scripts/configure.ts, do not edit.
// The production build replaces environment.ts with environment.prod.ts (angular.json fileReplacements).

import { Environment } from './model';

export const environment: Environment = {
${lines.join('\n')}
};
`;
}
