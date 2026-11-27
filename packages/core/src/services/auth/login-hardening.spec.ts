jest.mock('../../env', () => ({
	env: { JWT_SECRET: 'unit-test-secret', MULTI_TENANT: true },
}));

import { isExactLoginFilter } from './AuthService';
import { LoginThrottle } from './login-throttle';

describe('isExactLoginFilter (logins never take operator objects)', () => {
	it('accepts exact string values', () => {
		expect(isExactLoginFilter({ username: 'acme_store' })).toBe(true);
		expect(isExactLoginFilter({ email: 'owner@acme.test' })).toBe(true);
	});

	it('refuses operators, non-strings and empty filters', () => {
		expect(isExactLoginFilter({ username: { $regex: '^a' } })).toBe(false);
		expect(isExactLoginFilter({ username: { $ne: null } })).toBe(false);
		expect(isExactLoginFilter({ username: ['a', 'b'] })).toBe(false);
		expect(isExactLoginFilter({ username: 42 })).toBe(false);
		expect(isExactLoginFilter({ username: '' })).toBe(false);
		expect(isExactLoginFilter({ $where: 'sleep(1000)' })).toBe(false);
		expect(isExactLoginFilter({})).toBe(false);
		expect(isExactLoginFilter(null)).toBe(false);
		expect(isExactLoginFilter('acme')).toBe(false);
	});
});

describe('LoginThrottle', () => {
	it('blocks a login after too many wrong passwords, until the window passes', () => {
		let now = 0;
		const throttle = new LoginThrottle(3, 1000, () => now);

		throttle.fail('carrier:sam');
		throttle.fail('carrier:sam');
		expect(throttle.isBlocked('carrier:sam')).toBe(false);

		throttle.fail('carrier:sam');
		expect(throttle.isBlocked('carrier:sam')).toBe(true);
		// another login is not affected
		expect(throttle.isBlocked('carrier:kim')).toBe(false);

		now = 1000;
		expect(throttle.isBlocked('carrier:sam')).toBe(false);
	});

	it('forgets the failures after a correct password', () => {
		const throttle = new LoginThrottle(2, 1000, () => 0);

		throttle.fail('warehouse:acme');
		throttle.reset('warehouse:acme');
		throttle.fail('warehouse:acme');

		expect(throttle.isBlocked('warehouse:acme')).toBe(false);
	});
});
