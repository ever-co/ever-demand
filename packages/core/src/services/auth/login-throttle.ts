/**
 * Slows password guessing: after MAX_FAILURES wrong passwords for one login
 * (role + username or email) within WINDOW_MS, that login is refused until
 * the window passes, without checking the password. Per process; a correct
 * password resets the count.
 */
export const LOGIN_MAX_FAILURES = 10;
export const LOGIN_WINDOW_MS = 15 * 60_000;

/** Entries kept at most (older windows are dropped first). */
const MAX_ENTRIES = 50_000;

export class LoginThrottle {
	private readonly failures = new Map<
		string,
		{ count: number; since: number }
	>();

	constructor(
		private readonly maxFailures = LOGIN_MAX_FAILURES,
		private readonly windowMs = LOGIN_WINDOW_MS,
		private readonly now: () => number = Date.now,
	) {}

	isBlocked(key: string): boolean {
		const entry = this.current(key);
		return entry != null && entry.count >= this.maxFailures;
	}

	fail(key: string): void {
		const entry = this.current(key) ?? { count: 0, since: this.now() };

		entry.count += 1;
		this.failures.delete(key);
		this.failures.set(key, entry);

		while (this.failures.size > MAX_ENTRIES) {
			this.failures.delete(this.failures.keys().next().value as string);
		}
	}

	reset(key: string): void {
		this.failures.delete(key);
	}

	private current(key: string) {
		const entry = this.failures.get(key);

		if (entry && this.now() - entry.since >= this.windowMs) {
			this.failures.delete(key);
			return undefined;
		}

		return entry;
	}
}

export const loginThrottle = new LoginThrottle();
