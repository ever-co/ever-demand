/**
 * Loads the Google Maps JavaScript API (places + drawing) once.
 *
 * Same script as common-angular's `GoogleMapsLoader`, but the promise also settles when the
 * script cannot load (offline, blocked, no key), so a missing Google Maps never blocks the app
 * from booting: the maps stay empty, as they did before when the key was missing.
 */
let loading: Promise<boolean> | undefined;

export function loadGoogleMaps(
	apiKey: string,
	doc: Document = document,
	timeoutMs = 15000
): Promise<boolean> {
	if ((globalThis as any).google?.maps) {
		return Promise.resolve(true);
	}
	if (loading) {
		return loading;
	}

	loading = new Promise<boolean>((resolve) => {
		const done = (ok: boolean) => {
			clearTimeout(timer);
			resolve(ok);
		};
		const timer = setTimeout(() => done(false), timeoutMs);

		(globalThis as any).__onGoogleLoaded = () => done(true);

		const script = doc.createElement('script');
		script.src =
			'https://maps.googleapis.com/maps/api/js' +
			`?key=${encodeURIComponent(apiKey ?? '')}` +
			'&libraries=places,drawing&callback=__onGoogleLoaded';
		script.type = 'text/javascript';
		script.async = true;
		script.onerror = () => done(false);
		doc.head.appendChild(script);
	});

	return loading;
}

/** For tests. */
export function resetGoogleMapsLoader(): void {
	loading = undefined;
}
