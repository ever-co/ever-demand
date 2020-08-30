import { env } from './env';

// attempt to set memory limit for NodeJS to be greater than default
// (aprox 1.7Gb)
import v8 from 'v8';
console.log('Setting NodeJS Max memory usage limit to ' + env.WEB_MEMORY);
v8.setFlagsFromString('--max_old_space_size=' + env.WEB_MEMORY);

import 'reflect-metadata';
import sourceMapSupport from 'source-map-support';
import moduleAlias from 'module-alias';

try {
	if (global.v8debug) {
		global.v8debug.Debug.setBreakOnException();
	}

	sourceMapSupport.install();

	moduleAlias.addAliases({
		'@pyro/db-server': __dirname + '/@pyro/db-server',
		'@pyro/io': __dirname + '/@pyro/io',
		'@pyro/db': '@ever-platform/common/build/@pyro/db',
		'@modules/server.common': '@ever-platform/common/build/',
	});
} catch (err) {
	console.error(err);
}

import BluebirdPromise from 'bluebird';
import mongoose from 'mongoose';
import { createEverLogger } from './helpers/Log';
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

(mongoose as any).Promise = BluebirdPromise;

(async () => {
	// needs TypeORM connection to be ready before we initialize Services
	await ServicesApp.CreateTypeORMConnection();

	const app = servicesContainer.get<ServicesApp>(ServicesApp);

	await app.start(async () => {
		// load NestJS modules dynamically, because needs all services to be initialized before
		const bootstrapNest = await require('./nest-bootstrap').bootstrapNest;
		// bootstrap NestJS modules/controllers/DI/etc
		bootstrapNest();
	});
})();
