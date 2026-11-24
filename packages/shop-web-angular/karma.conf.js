// Karma configuration for `ng test` (angular.json > ever-shop-web > test).
// https://karma-runner.github.io/6.3/config/configuration-file.html

module.exports = function (config) {
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
		reporters: ['progress', 'kjhtml'],
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
