// Unit tests (src/**/*.spec.ts). The API e2e suite has its own config: jest.e2e.config.js.
//
// Nest 12, inversify 8, uuid, faker, envalid, ... ship only ES modules. Our code is
// CommonJS and loads them with require(esm), which Jest supports natively when Node
// runs with --experimental-vm-modules (set by the `test` scripts in package.json).

/** @type {import('jest').Config} */
module.exports = {
	rootDir: 'src',
	testEnvironment: 'node',
	testRegex: '\\.spec\\.ts$',
	moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs', 'json', 'node'],
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.spec.json' }],
	},
	moduleNameMapper: {
		'^@pyro/db-server(.*)$': '<rootDir>/@pyro/db-server$1',
		'^@pyro/io(.*)$': '<rootDir>/@pyro/io$1',
		'^@pyro/db(.*)$': '<rootDir>/../../common/src/@pyro/db$1',
		'^@modules/server.common(.*)$': '<rootDir>/../../common/src$1',
	},
	// like a single-tenant install: everything runs in one default tenant
	setupFiles: ['<rootDir>/test/unit/setup-tenant.ts'],
	coverageDirectory: '../coverage',
	collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!test/**'],
};
