/** Jest with the jest-expo preset (iOS platform), React Native Testing Library and our mocks. */
module.exports = {
	preset: 'jest-expo',
	// jest-expo's list plus the ESM-only state libraries (immer 11, Redux Toolkit 2).
	transformIgnorePatterns: [
		'/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|react-navigation|@react-navigation|immer|@reduxjs|redux|reselect|react-redux))',
		'/node_modules/react-native-reanimated/plugin/',
		'/node_modules/@react-native/babel-preset/',
	],
	setupFiles: ['./jest.setup.ts'],
	testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/test/**'],
	clearMocks: true,
	// Screen tests render the whole app (navigation, Paper, Redux, Apollo). The first test that reaches a screen
	// pays for loading it: ~0.5 s on a laptop, but over Jest's 5 s default on a busy shared CI runner (Node job, run
	// 45740352763). A passing test still ends as soon as its expectations hold. The waitFor / findBy* default is
	// raised in jest.setup.ts.
	testTimeout: 30_000,
};
