/** Saves the session slice to AsyncStorage (the Ionic app's `localStorage`) and loads it back. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppStore } from '.';
import { sessionActions, type SessionState } from './session';

export const SESSION_STORAGE_KEY = 'ever-shop-session';

export async function loadSession(): Promise<Partial<SessionState>> {
	try {
		const json = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
		return json ? (JSON.parse(json) as Partial<SessionState>) : {};
	} catch {
		return {};
	}
}

/** Writes the session whenever it changes. Returns the unsubscribe function. */
export function persistSession(store: AppStore): () => void {
	let last = store.getState().session;
	return store.subscribe(() => {
		const session = store.getState().session;
		if (session !== last) {
			last = session;
			AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session)).catch(() => {
				// storage full or unavailable: the app keeps working from memory
			});
		}
	});
}

export async function hydrateSession(store: AppStore): Promise<void> {
	store.dispatch(sessionActions.hydrate(await loadSession()));
}
