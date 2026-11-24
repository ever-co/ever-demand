// Karma configuration for `ng test` (angular.json > ever-shop-web > test).
// https://karma-runner.github.io/6.3/config/configuration-file.html

module.exports = function (config) {
	// `ng test --code-coverage` adds the `coverage` reporter (karma-coverage,
	// not installed here) unless a coverage reporter is listed already, so
	// list the installed coverage-istanbul reporter for coverage runs.
	const codeCoverage = Boolean(
		config.buildWebpack &&
			config.buildWebpack.options &&
			config.buildWebpack.options.codeCoverage
	);

	config.set({
		basePath: '',
		frameworks: ['jasmine', '@angular-devkit/build-angular'],
		plugins: [
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-jasmine-html-reporter'),
			require('karma-coverage-istanbul-reporter'),
			require('@angular-devkit/build-angular/plugins/karma'),
		],
		client: {
			clearContext: false, // leave Jasmine Spec Runner output visible in browser
		},
		coverageIstanbulReporter: {
			dir: require('path').join(__dirname, './coverage'),
			reports: ['html', 'lcovonly', 'text-summary'],
			fixWebpackSourcePaths: true,
		},
		reporters: codeCoverage
			? ['progress', 'kjhtml', 'coverage-istanbul']
			: ['progress', 'kjhtml'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ['Chrome'],
		customLaunchers: {
			// Headless Chrome for CI containers, where the sandbox is not available
			ChromeHeadlessCI: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox', '--disable-gpu'],
			},
		},
		singleRun: false,
		restartOnFileChange: true,
	});
};
