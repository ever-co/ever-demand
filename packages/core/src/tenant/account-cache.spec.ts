import {
	ACCOUNT_CACHE_TTL_MS,
	cachedAccount,
	forgetCachedAccount,
	rememberAccount,
} from './account-cache';

describe('account cache (accounts behind login tokens)', () => {
	beforeEach(() => forgetCachedAccount());

	it('keeps an account for ACCOUNT_CACHE_TTL_MS, a missing one (null) too', () => {
		rememberAccount('warehouse:w1', { isDeleted: false }, 0);
		rememberAccount('user:u1', null, 0);

		expect(cachedAccount('warehouse:w1', ACCOUNT_CACHE_TTL_MS - 1)).toEqual({ account: { isDeleted: false } });
		expect(cachedAccount('user:u1', 1)).toEqual({ account: null });
		expect(cachedAccount('warehouse:w1', ACCOUNT_CACHE_TTL_MS)).toBeUndefined();
		expect(cachedAccount('carrier:c1', 0)).toBeUndefined();
	});

	it('forgets one id in every role, or everything', () => {
		const now = Date.now();
		rememberAccount('admin:x1', {}, now);
		rememberAccount('user:x1', {}, now);
		rememberAccount('user:x2', {}, now);

		forgetCachedAccount('x1');
		expect(cachedAccount('admin:x1', now)).toBeUndefined();
		expect(cachedAccount('user:x1', now)).toBeUndefined();
		expect(cachedAccount('user:x2', now)).toBeDefined();

		forgetCachedAccount();
		expect(cachedAccount('user:x2', now)).toBeUndefined();
	});
});
