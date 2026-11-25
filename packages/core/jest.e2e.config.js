// API e2e suite (test/e2e/*.e2e-spec.ts): boots the built API (`node build/main.js`)
// against a real MongoDB and talks to it over HTTP, GraphQL, socket.io and graphql-ws.
//
//   pnpm --filter @ever-platform/core db:test:up   # Docker mongo:8 on localhost:27018
//   pnpm --filter @ever-platform/core build
//   pnpm --filter @ever-platform/core test:e2e
//
// See test/e2e/server.ts for the ports and the environment of the API under test.

/** @type {import('jest').Config} */
module.exports = {
	rootDir: 'test/e2e',
	testEnvironment: 'node',
	testRegex: '\.e2e-spec\.ts$',
	moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs', 'json'],
	transform: {
		'^.+\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../../tsconfig.spec.json' }],
	},
	globalSetup: '<rootDir>/global-setup.ts',
	globalTeardown: '<rootDir>/global-teardown.ts',
	testSequencer: '<rootDir>/sequencer.js',
	testTimeout: 60000,
	// keep-alive HTTP connections of fetch() to the API would hold Jest a few
	// seconds after the run; the API process itself is stopped in globalTeardown
	forceExit: true,
};
