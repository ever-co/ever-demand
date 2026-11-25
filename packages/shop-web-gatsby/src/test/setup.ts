import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { navigate } from './gatsby';

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.mocked(navigate).mockClear();
});

// jsdom has no matchMedia (nuka-carousel asks for prefers-reduced-motion)
if (!window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as MediaQueryList;
}

// ... nor ResizeObserver (nuka-carousel measures its slides)
if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
}
