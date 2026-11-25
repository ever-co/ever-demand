import * as Crypto from 'expo-crypto';

/** A random UUID v4 (call ids, subscription ids, the device uuid). */
export function randomId(): string {
	const webCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
	if (webCrypto?.randomUUID) {
		return webCrypto.randomUUID();
	}
	try {
		const id = Crypto.randomUUID();
		if (id) {
			return id;
		}
	} catch {
		// fall through to the Math.random version below
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
}
