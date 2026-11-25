import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while Gatsby's static HTML is rendered and hydrated, true afterwards. Content that
 * depends on the browser (the stored user, the route params of a client-only page) waits for
 * it, so the first client render matches the static HTML (no hydration mismatch).
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
}
