#!/usr/bin/env node
// Starts / stops the MongoDB the API e2e tests (and a local API boot) use:
// Docker container `ever-demand-core-mongo` (image mongo:8) on host port 27018.
//
//   node scripts/test-mongo.mjs up     start it (creates it the first time), wait until it answers
//   node scripts/test-mongo.mjs down   stop and remove it (its data is thrown away)
//
// Override with CORE_TEST_MONGO_NAME / CORE_TEST_MONGO_PORT / CORE_TEST_MONGO_IMAGE.
import { execFileSync, spawnSync } from 'node:child_process';

const name = process.env.CORE_TEST_MONGO_NAME || 'ever-demand-core-mongo';
const port = process.env.CORE_TEST_MONGO_PORT || '27018';
const image = process.env.CORE_TEST_MONGO_IMAGE || 'mongo:8';

function docker(args, options = {}) {
	return spawnSync('docker', args, { encoding: 'utf8', ...options });
}

function state() {
	const res = docker(['inspect', '-f', '{{.State.Running}}', name]);
	if (res.status !== 0) {
		return 'missing';
	}
	return res.stdout.trim() === 'true' ? 'running' : 'stopped';
}

async function waitUntilReady() {
	const deadline = Date.now() + 120_000;
	while (Date.now() < deadline) {
		const res = docker([
			'exec',
			name,
			'mongosh',
			'--quiet',
			'--eval',
			'db.runCommand({ ping: 1 }).ok',
		]);
		if (res.status === 0 && res.stdout.trim().endsWith('1')) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error(`MongoDB in ${name} did not answer within 2 minutes`);
}

const command = process.argv[2];

if (command === 'up') {
	const current = state();
	if (current === 'missing') {
		execFileSync(
			'docker',
			[
				'run',
				'-d',
				'--name',
				name,
				'-p',
				`127.0.0.1:${port}:27017`,
				'--memory',
				'768m',
				image,
				'--wiredTigerCacheSizeGB',
				'0.25',
			],
			{ stdio: 'inherit' }
		);
	} else if (current === 'stopped') {
		execFileSync('docker', ['start', name], { stdio: 'inherit' });
	}
	await waitUntilReady();
	console.log(`MongoDB ready at mongodb://localhost:${port} (container ${name})`);
} else if (command === 'down') {
	if (state() !== 'missing') {
		execFileSync('docker', ['rm', '-f', name], { stdio: 'inherit' });
	}
	console.log(`Container ${name} removed`);
} else {
	console.error('usage: node scripts/test-mongo.mjs up|down');
	process.exit(2);
}
