import fs from 'fs';
import os from 'os';
import path from 'path';

const logsPath = fs.mkdtempSync(path.join(os.tmpdir(), 'core-typeorm-spec-'));

jest.mock('../../env', () => ({
	env: { DB_URI: 'mongodb://db.example:27017/ever_test', LOGS_PATH: logsPath },
}));

import {
	getTypeORMDataSource,
	getTypeORMEntities,
	getTypeORMOptions,
	isDbSsl,
} from '../../helpers/typeorm';
import { createStripeClient, STRIPE_API_VERSION } from '../../helpers/stripe';

describe('TypeORM options (helpers/typeorm.ts)', () => {
	const saved = { ...process.env };

	afterEach(() => {
		process.env = { ...saved };
	});

	afterAll(() => {
		fs.rmSync(logsPath, { recursive: true, force: true });
	});

	it('leaves TLS to DB_URI by default', () => {
		delete process.env.DB_SSL_MODE;
		delete process.env.DB_NAME;

		const options = getTypeORMOptions();

		expect(options).toMatchObject({
			type: 'mongodb',
			url: 'mongodb://db.example:27017/ever_test',
			database: 'ever_development',
			synchronize: true,
			logger: 'file',
		});
		expect(options.entities).toEqual(getTypeORMEntities());
		// so `?tls=true` in DB_URI (DocumentDB's gateway) is not overridden by tls: false
		expect('tls' in options).toBe(false);
		expect('tlsCAFile' in options).toBe(false);
		expect(getTypeORMEntities()).toHaveLength(11);
	});

	it.each([
		[undefined, false],
		['', false],
		['false', false],
		['true', true],
		['require', true],
	])('DB_SSL_MODE=%p means TLS %p', (mode, expected) => {
		if (mode === undefined) {
			delete process.env.DB_SSL_MODE;
		} else {
			process.env.DB_SSL_MODE = mode;
		}

		expect(isDbSsl()).toBe(expected);
	});

	it('uses the system CAs for TLS when DB_CA_CERT is empty', () => {
		process.env.DB_SSL_MODE = 'true';
		delete process.env.DB_CA_CERT;

		const options = getTypeORMOptions();

		expect(options.tls).toBe(true);
		expect(options.tlsCAFile).toBeUndefined();
	});

	it('writes the CA of DB_CA_CERT and uses it for TLS', () => {
		process.env.DB_SSL_MODE = 'true';
		process.env.DB_CA_CERT = Buffer.from('-----BEGIN CERTIFICATE-----').toString('base64');
		process.env.DB_NAME = 'ever_prod';

		const options = getTypeORMOptions();

		expect(options.tls).toBe(true);
		expect(options.database).toBe('ever_prod');
		expect(fs.readFileSync(options.tlsCAFile, 'ascii')).toBe('-----BEGIN CERTIFICATE-----');
	});

	it('refuses to hand out the DataSource before it is initialized', () => {
		expect(() => getTypeORMDataSource()).toThrow(/not initialized/);
	});
});

describe('Stripe client (helpers/stripe.ts)', () => {
	it('stays on the API version the payment flows were written against', () => {
		expect(STRIPE_API_VERSION).toBe('2020-08-27');

		const stripe = createStripeClient('sk_test_123');
		expect(stripe.getApiField('version')).toBe('2020-08-27');
	});

	it('refuses an empty key (the services create it on first use only)', () => {
		expect(() => createStripeClient('')).toThrow();
	});
});
