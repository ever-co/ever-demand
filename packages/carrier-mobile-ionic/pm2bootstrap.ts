require('dotenv').config();
const pm2 = require('pm2');

import { env } from './scripts/env';

const MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
const PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
const PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
const appName = process.env.PM2_APP_NAME || 'EverCarrier';
const instances = env.WEB_CONCURRENCY;
const maxMemory = env.WEB_MEMORY;
const port = env.PORT;

pm2.connect(function () {
	pm2.start(
		{
			script: './www/out-tsc/app.js',
			name: appName, // ----> THESE ATTRIBUTES ARE OPTIONAL:
			exec_mode: 'fork', // ----> https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#schema
			instances,
			max_memory_restart: maxMemory + 'M', // Auto restart if process taking more than XXmo
			env: {
				// If needed declare some environment variables
				NODE_ENV: 'production',
				PORT: port,
				KEYMETRICS_PUBLIC: PUBLIC_KEY,
				KEYMETRICS_SECRET: PRIVATE_KEY,
			},
			post_update: ['yarn install'], // Commands to execute once we do a pull from Keymetrics
		},
		function () {
			pm2.dump(console.error);
			// Display logs in standard output
			pm2.launchBus(function (err, bus) {
				console.log('[PM2] Log streaming started');

				bus.on('log:out', function (packet) {
					console.log(
						'[App:%s] %s',
						packet.process.name,
						packet.data
					);
				});

				bus.on('log:err', function (packet) {
					console.error(
						'[App:%s][Err] %s',
						packet.process.name,
						packet.data
					);
				});
			});
		}
	);
});
