module.exports = {
	roots: ['<rootDir>/src'],
	testURL: 'http://localhost',
	testEnvironment: 'node',
	transform: {
		'^.+\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\.|/)(test|spec))\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'^@pyro/db-server(.*)$': '<rootDir>/src/@pyro/db-server$1',
		'^@pyro/db(.*)$': '<rootDir>/../common/src/@pyro/db$1',
		'^@pyro/io(.*)$': '<rootDir>/src/@pyro/io$1',
		'^@modules/server.common(.*)$': '<rootDir>/../common/src$1',
		'^@modules(.*)$': '<rootDir>/src/modules$1',
	},
};
