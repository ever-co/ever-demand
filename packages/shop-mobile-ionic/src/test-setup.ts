// Runs before every spec file (angular.json test.options.setupFiles).
// The polyfills (zone.js, reflect-metadata) and the Angular TestBed are set up by the builder.
import { afterEach } from 'vitest';

afterEach(() => {
	// The Store reads and writes window.localStorage directly.
	localStorage.clear();
});
