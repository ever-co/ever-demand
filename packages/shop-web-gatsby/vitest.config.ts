import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests of the components, pages and helpers (jsdom, Testing Library). */
export default defineConfig({
	resolve: {
		alias: {
			// Gatsby's browser API (navigate, Link) as plain test doubles
			gatsby: fileURLToPath(new URL('./src/test/gatsby.tsx', import.meta.url)),
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.test.{ts,tsx}'],
		css: { modules: { classNameStrategy: 'non-scoped' } },
		env: {
			GATSBY_GQL_ENDPOINT: 'http://api.test/graphql',
		},
	},
});
