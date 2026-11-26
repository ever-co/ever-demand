import { defineConfig } from 'vitest/config';

// Merged into the Vitest config of `ng test` (@angular/build:unit-test, `runnerConfig`).
export default defineConfig({
	test: {
		// the PC running the lanes is shared: keep the worker pool small
		maxWorkers: 2,
		testTimeout: 15_000,
	},
});
