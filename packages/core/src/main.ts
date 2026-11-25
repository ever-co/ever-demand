import { env } from './env';

// attempt to set memory limit for NodeJS to be greater than default
// (aprox 1.7Gb)
import v8 from 'v8';
console.log('Setting NodeJS Max memory usage limit to ' + env.WEB_MEMORY);
v8.setFlagsFromString('--max_old_space_size=' + env.WEB_MEMORY);

import 'reflect-metadata';
import path from 'path';
import moduleAlias = require('module-alias');

try {
	// Stack traces point at the TypeScript sources (build/*.js.map)
	process.setSourceMapsEnabled(true);

	// The compiled code keeps the TypeScript path aliases: map them to our own
	// @pyro folders and to the compiled output of @ever-platform/common.
	// Absolute paths, because the files of common use the aliases too and,
	// with pnpm, `@ever-platform/common` can only be resolved from core.
	const commonBuild = path.join(
		path.dirname(require.resolve('@ever-platform/common/package.json')),
		'build'
	);

	moduleAlias.addAliases({
		'@pyro/db-server': path.join(__dirname, '@pyro/db-server'),
		'@pyro/io': path.join(__dirname, '@pyro/io'),
		'@pyro/db': path.join(commonBuild, '@pyro/db'),
		'@modules/server.common': commonBuild,
	});
} catch (err) {
	console.error(err);
}

import mongoose from 'mongoose';

// Mongoose 6 (used before) dropped query filter properties that are not in the
// schema; Mongoose 7+ keeps them by default. Keep the old behaviour, so the
// existing queries match the same documents. Set before any schema is created.
mongoose.set('strictQuery', true);

import { createEverLogger } from './helpers/Log';
import { initTypeORMDataSource } from './helpers/typeorm';
import { servicesContainer } from './services/inversify.config';
import { ServicesApp } from './services/services.app';

const log = createEverLogger({ name: 'uncaught' });

process.on('uncaughtException', (err) => {
	try {
		log.error(err, 'Caught exception: ' + err);
	} catch (logWritingErr) {
		try {
			console.error("Can't write to log!!!!!!");
			console.error(logWritingErr);
		} catch (consoleWritingError) {}
	}

	console.error(err);
});

process.on('unhandledRejection', (err, promise) => {
	try {
		log.error(err, 'Uncaught rejection: ' + err);
	} catch (logWritingErr) {
		try {
			console.error("Can't write to log!!!!!!");
			console.error(logWritingErr);
		} catch (consoleWritingError) {}
	}

	console.error(err);
});

(async () => {
	// needs to test TypeORM connection and for it to be ready before we initialize Services
	const dataSource = await initTypeORMDataSource();

	console.log(
		`TypeORM DB connection created. DB connected: ${dataSource.isInitialized}`
	);

	// Services are created (inversify) only now, because some of them use
	// TypeORM repositories from the connection above.
	const app = servicesContainer.get(ServicesApp);

	await app.start(async () => {
		// load NestJS modules dynamically, because needs all services to be initialized before
		const { bootstrapNest }: typeof import('./nest-bootstrap') = require('./nest-bootstrap');
		// bootstrap NestJS modules/controllers/DI/etc
		await bootstrapNest();
	});
})();
