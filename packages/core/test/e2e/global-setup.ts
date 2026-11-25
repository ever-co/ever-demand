import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import {
	API_URL,
	CORE_DIR,
	DB_NAME,
	MONGO_URL,
	SERVER_LOG,
	SERVICES_URL,
	TMP_DIR,
	serverEnv,
} from './server';

declare global {
	// eslint-disable-next-line no-var
	var __CORE_E2E_SERVER__: ChildProcess | undefined;
}

const BOOT_TIMEOUT_MS = 180_000;

async function resetDatabase() {
	const client = new MongoClient(MONGO_URL, {
		serverSelectionTimeoutMS: 5000,
	});

	try {
		await client.connect();
	} catch (err) {
		throw new Error(
			`MongoDB is not reachable at ${MONGO_URL} (${(err as Error).message}). ` +
				'Start it with `pnpm --filter @ever-platform/core db:test:up` ' +
				'(Docker container ever-demand-core-mongo, mongo:8 on port 27018) ' +
				'or point CORE_E2E_MONGO_URL at another server.'
		);
	}

	try {
		await client.db(DB_NAME).dropDatabase();
	} finally {
		await client.close();
	}
}

async function isUp(url: string): Promise<boolean> {
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
		return res.status === 200;
	} catch {
		return false;
	}
}

function tail(file: string, lines = 60): string {
	try {
		return fs.readFileSync(file, 'utf8').split('\n').slice(-lines).join('\n');
	} catch {
		return '(no server log)';
	}
}

export default async function globalSetup() {
	const main = path.join(CORE_DIR, 'build', 'main.js');

	if (!fs.existsSync(main)) {
		throw new Error(
			`${main} does not exist: build the API first (pnpm --filter @ever-platform/core build)`
		);
	}

	await resetDatabase();

	fs.mkdirSync(TMP_DIR, { recursive: true });
	const log = fs.openSync(SERVER_LOG, 'w');

	// A clean environment: nothing from a local .env or the shell (e.g. the
	// --experimental-vm-modules NODE_OPTIONS of Jest) leaks into the API.
	const { NODE_OPTIONS, ...parentEnv } = process.env;
	for (const name of Object.keys(serverEnv())) {
		delete parentEnv[name];
	}

	const child = spawn(process.execPath, [main], {
		cwd: CORE_DIR,
		env: { ...parentEnv, ...serverEnv() },
		stdio: ['ignore', log, log],
		windowsHide: true,
	});

	globalThis.__CORE_E2E_SERVER__ = child;

	let exited: number | null = null;
	child.once('exit', (code) => {
		exited = code ?? -1;
	});

	const deadline = Date.now() + BOOT_TIMEOUT_MS;

	while (Date.now() < deadline) {
		if (exited !== null) {
			throw new Error(
				`The API exited with code ${exited} while booting. Server log (${SERVER_LOG}):\n${tail(SERVER_LOG)}`
			);
		}

		// The NestJS app (GraphQL, REST, graphql-ws) starts last, after
		// express and socket.io: once it is ready everything is.
		if (
			(await isUp(`${API_URL}/api/health/ready`)) &&
			(await isUp(SERVICES_URL))
		) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	child.kill();
	throw new Error(
		`The API did not get ready within ${BOOT_TIMEOUT_MS / 1000}s. Server log (${SERVER_LOG}):\n${tail(SERVER_LOG)}`
	);
}
