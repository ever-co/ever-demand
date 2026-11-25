// node --test scripts/  (Node's built-in runner; no Angular needed)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Env } from './env.ts';
import { renderEnvironment } from './environment-file.ts';

const env = {
	production: false,
	IS_DOCKER: false,
	SERVICES_ENDPOINT: 'http://localhost:5500',
	HTTPS_SERVICES_ENDPOINT: 'https://localhost:2087',
	GQL_ENDPOINT: 'http://localhost:8443/graphql',
	GQL_SUBSCRIPTIONS_ENDPOINT: 'ws://localhost:2086/subscriptions',
	GOOGLE_MAPS_API_KEY: '',
	DEFAULT_LATITUDE: 42.6459136,
	DEFAULT_LONGITUDE: 23.3332736,
	NO_INTERNET_LOGO: 'assets/images/ever-logo.svg',
	MAP_MERCHANT_ICON_LINK: 'm',
	MAP_USER_ICON_LINK: 'u',
	MAP_CARRIER_ICON_LINK: 'c',
	API_FILE_UPLOAD_URL: 'https://api.cloudinary.com/v1_1/evereq/upload',
	COMPANY_NAME: "Ever Co. 'LTD'",
	COMPANY_SITE_LINK: 'https://ever.co/',
	COMPANY_GITHUB_LINK: 'https://github.com/ever-co',
	COMPANY_FACEBOOK_LINK: 'f',
	COMPANY_TWITTER_LINK: 't',
	COMPANY_LINKEDIN_LINK: 'l',
	GENERATE_PASSWORD_CHARSET: 'abc$_',
	CURRENCY_SYMBOL: '$',
	SETTINGS_APP_TYPE: 'admin',
	SETTINGS_MAINTENANCE_API_URL: '',
	DEFAULT_LANGUAGE: 'en-US',
	PORT: 4200,
} satisfies Env;

test('writes the real values outside Docker', () => {
	const out = renderEnvironment(env, { isProd: true, isDocker: false });
	assert.match(out, /production: true,/);
	assert.match(out, /GQL_ENDPOINT: "http:\/\/localhost:8443\/graphql",/);
	assert.match(
		out,
		/GQL_SUBSCRIPTIONS_ENDPOINT: "ws:\/\/localhost:2086\/subscriptions",/,
	);
	assert.match(out, /DEFAULT_LATITUDE: 42.6459136,/);
	// quotes in values are escaped, so the generated module stays valid
	assert.match(out, /COMPANY_NAME: "Ever Co. 'LTD'",/);
	assert.match(out, /import \{ Environment \} from '\.\/model';/);
});

test('writes DOCKER_ placeholders for the entrypoint sed in Docker', () => {
	const out = renderEnvironment(env, { isProd: true, isDocker: true });
	for (const key of [
		'SERVICES_ENDPOINT',
		'GQL_ENDPOINT',
		'GOOGLE_MAPS_API_KEY',
		'SETTINGS_MAINTENANCE_API_URL',
	]) {
		assert.match(out, new RegExp(`${key}: "DOCKER_${key}",`));
	}
	// numbers keep their build-time value (the entrypoint does not replace them)
	assert.match(out, /DEFAULT_LONGITUDE: 23.3332736,/);
});

test('marks dev builds as non production', () => {
	assert.match(
		renderEnvironment(env, { isProd: false, isDocker: false }),
		/production: false,/,
	);
});
