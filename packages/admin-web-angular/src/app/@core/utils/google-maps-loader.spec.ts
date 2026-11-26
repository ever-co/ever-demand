import { loadGoogleMaps, resetGoogleMapsLoader } from './google-maps-loader';

describe('loadGoogleMaps', () => {
	beforeEach(() => {
		resetGoogleMapsLoader();
		delete (globalThis as any).google;
		document.head
			.querySelectorAll('script[src*="maps.googleapis.com"]')
			.forEach((s) => s.remove());
	});

	const script = () =>
		document.head.querySelector<HTMLScriptElement>(
			'script[src*="maps.googleapis.com"]',
		)!;

	it('adds the Maps script with the key, places + drawing and the callback', () => {
		void loadGoogleMaps('my key');
		expect(script().src).toContain('key=my%20key');
		expect(script().src).toContain('libraries=places,drawing');
		expect(script().src).toContain('callback=__onGoogleLoaded');
	});

	it('resolves true when Google calls back', async () => {
		const loading = loadGoogleMaps('k');
		(globalThis as any).__onGoogleLoaded();
		await expect(loading).resolves.toBe(true);
	});

	it('resolves false instead of hanging the app when the script fails', async () => {
		const loading = loadGoogleMaps('k');
		script().onerror!(new Event('error'));
		await expect(loading).resolves.toBe(false);
	});

	it('resolves false after the timeout', async () => {
		vi.useFakeTimers();
		try {
			const loading = loadGoogleMaps('k', document, 100);
			vi.advanceTimersByTime(150);
			await expect(loading).resolves.toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('loads once and skips loading when google.maps already exists', async () => {
		const first = loadGoogleMaps('k');
		expect(loadGoogleMaps('k')).toBe(first);

		resetGoogleMapsLoader();
		(globalThis as any).google = { maps: {} };
		await expect(loadGoogleMaps('k')).resolves.toBe(true);
	});
});
