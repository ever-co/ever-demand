import { defineConfig } from 'vitest/config';

// Merged into the config of `ng test` (@angular/build:unit-test, Vitest runner).
export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		// Shared PC: keep the worker pool small (docs/latest-stack/CONTRACT.md).
		maxWorkers: 2,
		restoreMocks: true,
		unstubGlobals: true,
	},
});
