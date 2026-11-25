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
};
