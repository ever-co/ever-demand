'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv').config();
var pm2 = require('pm2');
var env_1 = require('./scripts/env');
var MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
var PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
var PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
var appName = process.env.PM2_APP_NAME || 'EverMerchants';
var instances = env_1.env.WEB_CONCURRENCY;
var maxMemory = env_1.env.WEB_MEMORY;
var port = env_1.env.PORT;
pm2.connect(function() {
	pm2.start(
		{
			script: 'app.js',
			name: appName,
			exec_mode: 'fork',
			instances: instances,
			max_memory_restart: maxMemory + 'M',
			env: {
				// If needed declare some environment variables
				NODE_ENV: 'production',
				PORT: port,
				KEYMETRICS_PUBLIC: PUBLIC_KEY,
				KEYMETRICS_SECRET: PRIVATE_KEY
			},
			autorestart: true,
			post_update: ['yarn install'] // Commands to execute once we do a pull from Keymetrics
		},
		function() {
			pm2.dump(console.log);
			// Display logs in standard output
			pm2.launchBus(function(err, bus) {
				console.log('[PM2] Log streaming started');
				bus.on('log:out', function(packet) {
					console.log(
						'[App:%s] %s',
						packet.process.name,
						packet.data
					);
				});
				bus.on('log:err', function(packet) {
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
//# sourceMappingURL=pm2bootstrap.js.map
