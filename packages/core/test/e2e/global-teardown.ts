export default async function globalTeardown() {
	const child = globalThis.__CORE_E2E_SERVER__;

	if (!child || child.exitCode !== null) {
		return;
	}

	const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));

	// only the API process this suite started, by its PID
	child.kill('SIGTERM');

	const timeout = new Promise<'timeout'>((resolve) =>
		setTimeout(() => resolve('timeout'), 10_000)
	);

	if ((await Promise.race([exited, timeout])) === 'timeout') {
		child.kill('SIGKILL');
		await exited;
	}

	globalThis.__CORE_E2E_SERVER__ = undefined;
}
