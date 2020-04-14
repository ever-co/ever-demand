import { env } from './env';
import util from 'util';
import path from 'path';
import os from 'os';
import PM2 from 'pm2/lib/API.js';
import cst from 'pm2/constants.js';

const pm2 = new PM2(
	env.isProd
		? {
				public_key: env.KEYMETRICS_PUBLIC_KEY,
				secret_key: env.KEYMETRICS_SECRET_KEY,
		  }
		: {}
);

const start = util.promisify(pm2.start.bind(pm2));
const interact = (private_key, public_key, machine_name) =>
	new Promise((resolve) =>
		pm2.interact(private_key, public_key, machine_name, resolve)
	);
const launchBus = util.promisify(pm2.launchBus.bind(pm2));
const runningApps = util.promisify(pm2.list.bind(pm2));
const dump = util.promisify(pm2.dump.bind(pm2));
const timeout = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
	// Display logs in standard output
	try {
		const bus = await launchBus();
		console.log('[PM2] Log streaming started');

		bus.on('log:out', (packet) => {
			console.log('[App:%s] %s', packet.process.name, packet.data);
		});

		bus.on('log:err', (packet) => {
			console.error('[App:%s][Err] %s', packet.process.name, packet.data);
		});
	} catch (err) {
		exitPM2();
	}
})();

(async () => {
	try {
		await start({
			pm2_home: path.join(os.homedir(), '.pm2'),
			script: './build/main.js',
			name: 'EverApi',
			daemon_mode: true,
			// See https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#schema
			exec_mode: 'fork',
			instances: env.WEB_CONCURRENCY,
			// Auto restart if process taking more than XXmo
			max_memory_restart: env.WEB_MEMORY + 'M',
			// post_update: ["npm install"] // Commands to execute once we do a pull from Keymetrics
			...(env.isDev ? { watch: true } : {}),
		});

		await dump();
	} catch (err) {
		console.error(err);
	}

	// autoExit();

	if (env.isProd) {
		await interact(
			env.KEYMETRICS_SECRET_KEY,
			env.KEYMETRICS_PUBLIC_KEY,
			env.KEYMETRICS_MACHINE_NAME
		);
	}

	process.on('SIGINT', function () {
		exitPM2();
	});

	process.on('SIGTERM', function () {
		exitPM2();
	});
})();

function exitPM2() {
	console.log('Exiting PM2');
	pm2.kill(function () {
		process.exit(0);
	});
}

/**
 * Exit current PM2 instance if 0 app is online
 */
async function autoExit() {
	const interval = 3000;
	const aliveInterval = interval * 1.5;

	let alive = false;

	while (true) {
		await timeout(interval);

		const aliveTimer = setTimeout(function () {
			if (!alive) {
				console.error('PM2 Daemon is dead');
				process.exit(1);
			}
		}, aliveInterval);

		try {
			const apps = await runningApps();

			clearTimeout(aliveTimer);
			alive = true;

			let appOnline = 0;

			apps.forEach(function (app) {
				if (
					app.pm2_env.status === cst.ONLINE_STATUS ||
					app.pm2_env.status === cst.LAUNCHING_STATUS
				) {
					appOnline++;
				}
			});

			console.log('check ' + appOnline);

			if (appOnline === 0) {
				console.log('0 application online, exiting');
				exitPM2();
			}
		} catch (err) {
			console.log('pm2.list got error');
			console.error(err);
			exitPM2();
			return;
		}
	}
}
