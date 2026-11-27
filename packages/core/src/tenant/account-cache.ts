/**
 * Cache of the accounts behind login tokens (tenant-resolver.ts reads them
 * fresh every 30 s). Its own module, so the database layer can drop an
 * account the moment it is removed or banned without importing the resolver.
 */
export const ACCOUNT_CACHE_TTL_MS = 30_000;

export const accountCache = new Map<string, { account: any; at: number }>();

/** Forgets the cached account of `id` (every role), or every cached account. */
export function forgetCachedAccount(id?: string | null) {
	if (id == null || id === '') {
		accountCache.clear();
		return;
	}

	for (const key of accountCache.keys()) {
		if (key.endsWith(`:${id}`)) {
			accountCache.delete(key);
		}
	}
}
