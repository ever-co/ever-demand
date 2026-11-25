// NOTE: do NOT ever put here any secure settings! (e.g. Secret Keys)
// We are using dotenv (.env) for consistency with other Platform projects
// This is Angular app and all settings will be loaded into the client browser!
//
// Usage: node scripts/configure.ts --environment=dev|prod
// (Node runs this TypeScript file directly through its built-in type stripping.)

import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { env } from './env.ts';
import { renderEnvironment } from './environment-file.ts';

const { values } = parseArgs({
	options: { environment: { type: 'string', default: 'dev' } },
	allowPositionals: true,
	strict: false,
});

const isProd = values.environment === 'prod';

if (!env.GOOGLE_MAPS_API_KEY) {
	console.warn(
		'WARNING: No Google Maps API Key defined in the .env. Google Maps may not be visible!'
	);
}

const content = renderEnvironment(env, { isProd, isDocker: env.IS_DOCKER });

const dest = isProd ? 'environment.prod.ts' : 'environment.ts';
const other = isProd ? 'environment.ts' : 'environment.prod.ts';

mkdirSync('./src/environments', { recursive: true });
writeFileSync(`./src/environments/${dest}`, content);
console.log(`Generated Angular environment file: ${dest}`);

// The other file only has to be a valid module for the type checker (the build swaps
// environment.ts for environment.prod.ts in production), so it gets the same content.
writeFileSync(`./src/environments/${other}`, content);
console.log(`Generated Angular environment file: ${other} (same values)`);
