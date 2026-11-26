import { assertProductionSecrets, Env, WEAK_SECRETS } from '../../env';
import {
	DEV_FIRST_ADMIN_PASSWORD,
	firstAdminPassword,
} from '../../services/admins/firstAdminPassword';

const strong = 'x'.repeat(48);

function envWith(overrides: Partial<Env>): Env {
	return {
		isProd: true,
		isDev: false,
		isTest: false,
		NODE_ENV: 'production',
		JWT_SECRET: strong,
		EXPRESS_SESSION_SECRET: strong,
		...overrides,
	} as Env;
}

describe('assertProductionSecrets', () => {
	it('lets production start with real secrets', () => {
		expect(() => assertProductionSecrets(envWith({}))).not.toThrow();
	});

	it.each([...WEAK_SECRETS])('refuses a production JWT_SECRET of %p', (weak) => {
		expect(() => assertProductionSecrets(envWith({ JWT_SECRET: weak }))).toThrow(
			/JWT_SECRET/
		);
	});

	it('names every weak secret in one message', () => {
		expect(() =>
			assertProductionSecrets(envWith({ JWT_SECRET: 'secretKey', EXPRESS_SESSION_SECRET: '' }))
		).toThrow(/JWT_SECRET and EXPRESS_SESSION_SECRET/);
	});

	it('does not check outside production', () => {
		expect(() =>
			assertProductionSecrets(
				envWith({ isProd: false, NODE_ENV: 'development', JWT_SECRET: '', EXPRESS_SESSION_SECRET: '' })
			)
		).not.toThrow();
	});
});

describe('firstAdminPassword', () => {
	it('uses ADMIN_PASSWORD when set', () => {
		expect(firstAdminPassword({ ADMIN_PASSWORD: 'S3cure!', isProd: true }, false)).toBe('S3cure!');
	});

	it('keeps the well-known default outside production', () => {
		expect(firstAdminPassword({ ADMIN_PASSWORD: '', isProd: false }, false)).toBe(
			DEV_FIRST_ADMIN_PASSWORD
		);
	});

	it('keeps the default for production demo deployments', () => {
		expect(firstAdminPassword({ ADMIN_PASSWORD: '', isProd: true }, true)).toBe(
			DEV_FIRST_ADMIN_PASSWORD
		);
	});

	it('has no default in production', () => {
		expect(firstAdminPassword({ ADMIN_PASSWORD: '', isProd: true }, false)).toBeNull();
	});
});
