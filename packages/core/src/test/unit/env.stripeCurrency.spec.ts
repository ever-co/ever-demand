// env.ts loads a local .env file first; keep it out, so only the values
// set here count.
jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('env STRIPE_CURRENCY', () => {
	const original = process.env.STRIPE_CURRENCY;

	// Loads env.ts afresh, the way the server does at boot.
	const loadEnv = (value: string | undefined) => {
		if (value === undefined) {
			delete process.env.STRIPE_CURRENCY;
		} else {
			process.env.STRIPE_CURRENCY = value;
		}

		let loaded: { STRIPE_CURRENCY: string } | undefined;

		jest.isolateModules(() => {
			loaded = require('../../env').env;
		});

		return loaded;
	};

	afterEach(() => {
		jest.restoreAllMocks();

		if (original === undefined) {
			delete process.env.STRIPE_CURRENCY;
		} else {
			process.env.STRIPE_CURRENCY = original;
		}
	});

	it('is ils when unset or blank', () => {
		expect(loadEnv(undefined).STRIPE_CURRENCY).toBe('ils');
		expect(loadEnv('').STRIPE_CURRENCY).toBe('ils');
		expect(loadEnv('   ').STRIPE_CURRENCY).toBe('ils');
	});

	it('is the configured code in lower case', () => {
		expect(loadEnv(' USD ').STRIPE_CURRENCY).toBe('usd');
	});

	it('stops the boot with a message naming the setting for an invalid value', () => {
		jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
			throw new Error(`process.exit(${code})`);
		}) as () => never);
		const logged = jest
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		expect(() => loadEnv('jpy')).toThrow('process.exit(1)');
		expect(() => loadEnv('dollars')).toThrow('process.exit(1)');

		// envalid prints the report and then a separate "Exiting with error"
		// line: keep the report lines.
		const output = logged.mock.calls
			.map((call) => call.join(' '))
			.filter((line) => line.includes('STRIPE_CURRENCY'));

		expect(output).toHaveLength(2);
		expect(output[0]).toMatch(/STRIPE_CURRENCY.*"jpy" is not supported/);
		expect(output[1]).toMatch(
			/STRIPE_CURRENCY.*must be a three-letter currency code/
		);
	});
});
