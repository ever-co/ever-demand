/**
 * Cache of the accounts behind login tokens (tenant-resolver.ts reads them
 * fresh every 30 s). Its own module, so the database layer can drop an
 * account the moment it is removed or banned without importing the resolver.
 */
export const ACCOUNT_CACHE_TTL_MS = 30_000;

const accounts = new Map<string, { account: unknown; at: number }>();

/**
 * The cached account of `key` (`<role>:<id>`): `{ account }` while it is
 * younger than ACCOUNT_CACHE_TTL_MS (the account may be null: no such
 * account), else undefined.
 */
export function cachedAccount(
	key: string,
	now = Date.now(),
): { account: any } | undefined {
	const hit = accounts.get(key);

	if (hit === undefined) {
		return undefined;
	}

	if (now - hit.at >= ACCOUNT_CACHE_TTL_MS) {
		accounts.delete(key);
		return undefined;
	}

	return { account: hit.account };
}

export function rememberAccount(
	key: string,
	account: unknown,
	now = Date.now(),
): void {
	accounts.set(key, { account, at: now });
}

/** Forgets the cached account of `id` (every role), or every cached account. */
export function forgetCachedAccount(id?: string | null): void {
	if (id == null || id === '') {
		accounts.clear();
		return;
	}

	for (const key of [...accounts.keys()]) {
		if (key.endsWith(`:${id}`)) {
			accounts.delete(key);
		}
	}
}
