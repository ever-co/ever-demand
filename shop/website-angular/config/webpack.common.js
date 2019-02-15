/**
 * @author: tipe.io
 */

console.log('using custom webpack config');

const helpers = require('./helpers');
const path = require('path');

/**
 * Webpack Plugins
 *
 * problem with copy-webpack-plugin
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackInlineManifestPlugin = require('webpack-inline-manifest-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');

const buildUtils = require('./build-utils');

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function(options) {
	const isProd = options.env === 'production';
	const APP_CONFIG = require(process.env.ANGULAR_CONF_FILE ||
		(isProd ? './config.prod.json' : './config.dev.json'));

	const METADATA = Object.assign(
		{},
		buildUtils.DEFAULT_METADATA,
		options.metadata || {}
	);
	const GTM_API_KEY = process.env.GTM_API_KEY || APP_CONFIG.gtmKey;

	const ngcWebpackConfig = buildUtils.ngcWebpackSetup(isProd, METADATA);
	const supportES2015 = buildUtils.supportES2015(METADATA.tsConfigPath);

	const entry = {
		polyfills: './src/polyfills.browser.ts',
		main: './src/main.browser.ts'
	};

	Object.assign(ngcWebpackConfig.plugin, {
		tsConfigPath: METADATA.tsConfigPath,
		mainPath: entry.main
	});

	return {
		entry: entry,

		resolve: {
			mainFields: [
				...(supportES2015 ? ['es2015'] : []),
				'browser',
				'module',
				'main'
			],
			extensions: ['.ts', '.js', '.json'],
			modules: [helpers.root('src'), helpers.root('node_modules')],
			alias: buildUtils.rxjsAlias(supportES2015),
			symlinks: false
		},

		module: {
			rules: [
				...ngcWebpackConfig.loaders,
				{
					test: /\.css$/,
					use: ['to-string-loader', 'css-loader'],
					exclude: [helpers.root('src', 'styles')]
				},
				{
					test: /\.scss$/,
					use: ['to-string-loader', 'css-loader', 'sass-loader'],
					exclude: [helpers.root('src', 'styles')]
				},
				{
					test: /\.html$/,
					use: 'raw-loader',
					exclude: [helpers.root('src/index.html')]
				},
				{
					test: /\.(jpg|png|gif)$/,
					use: 'file-loader'
				},
				{
					test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
					use: 'file-loader'
				}
			]
		},

		plugins: [
			// Custom
			new NormalModuleReplacementPlugin(
				/^module$/,
				require.resolve('../src/replaced-module-package.js')
			),

			new NormalModuleReplacementPlugin(
				/^mongoose$/,
				// For some reason, it does not work well with mongoose-placeholder.ts, so we reference JS here
				// it's anyway placeholder so we don't really care much about content to be in sync with TS (for now at least)
				require.resolve(
					'../src/modules/client.common.angular2/mongoose-placeholder.js'
				)
			),

			new NormalModuleReplacementPlugin(
				/^typeorm$/,
				// For some reason, it does not work well with typeorm-placeholder.ts, so we reference JS here
				// it's anyway placeholder so we don't really care much about content to be in sync with TS (for now at least)
				require.resolve(
					'../src/modules/client.common.angular2/typeorm-placeholder.js'
				)
			),

			/**
			 * Plugin: DefinePlugin
			 * Description: Define free variables.
			 * Useful for having development builds with debug logging or adding global constants.
			 *
			 * Environment helpers
			 *
			 * See: https://webpack.js.org/plugins/define-plugin/
			 */
			// NOTE: when adding more properties make sure you include them in custom-typings.d.ts
			new DefinePlugin({
				ENV: JSON.stringify(METADATA.ENV),
				HMR: METADATA.HMR,
				AOT: METADATA.AOT,
				'process.env.ENV': JSON.stringify(METADATA.ENV),
				'process.env.NODE_ENV': JSON.stringify(METADATA.ENV),
				'process.env.HMR': METADATA.HMR
				// 'FIREBASE_CONFIG': JSON.stringify(APP_CONFIG.firebase),
			}),

			/**
			 * Plugin: CopyWebpackPlugin
			 * Description: Copy files and directories in webpack.
			 *
			 * Copies project static assets.
			 *
			 * See: https://www.npmjs.com/package/copy-webpack-plugin
			 */
			new CopyWebpackPlugin(
				[
					{ from: 'src/assets', to: 'assets' },
					{ from: 'node_modules/mdi-svg/svg', to: 'icons' },
					{ from: 'src/meta' }
				],
				isProd ? { ignore: ['mock-data/**/*'] } : undefined
			),

			/*
			 * Plugin: HtmlWebpackPlugin
			 * Description: Simplifies creation of HTML files to serve your webpack bundles.
			 * This is especially useful for webpack bundles that include a hash in the filename
			 * which changes every compilation.
			 *
			 * See: https://github.com/ampedandwired/html-webpack-plugin
			 */
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				title: METADATA.title,
				chunksSortMode: function(a, b) {
					const entryPoints = [
						'inline',
						'polyfills',
						'sw-register',
						'styles',
						'vendor',
						'main'
					];
					return (
						entryPoints.indexOf(a.names[0]) -
						entryPoints.indexOf(b.names[0])
					);
				},
				metadata: METADATA,
				gtmKey: GTM_API_KEY,
				inject: 'body',
				xhtml: true,
				minify: isProd
					? {
							caseSensitive: true,
							collapseWhitespace: true,
							keepClosingSlash: true
					  }
					: false
			}),

			/**
			 * Plugin: ScriptExtHtmlWebpackPlugin
			 * Description: Enhances html-webpack-plugin functionality
			 * with different deployment options for your scripts including:
			 *
			 * See: https://github.com/numical/script-ext-html-webpack-plugin
			 */
			new ScriptExtHtmlWebpackPlugin({
				sync: /inline|polyfills|vendor/,
				defaultAttribute: 'async',
				preload: [/polyfills|vendor|main/],
				prefetch: [/chunk/]
			}),

			/**
			 * Plugin: HtmlElementsPlugin
			 * Description: Generate html tags based on javascript maps.
			 *
			 * If a publicPath is set in the webpack output configuration, it will be automatically added to
			 * href attributes, you can disable that by adding a "=href": false property.
			 * You can also enable it to other attribute by settings "=attName": true.
			 *
			 * The configuration supplied is map between a location (key) and an element definition object (value)
			 * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
			 *
			 * Example:
			 *  Adding this plugin configuration
			 *  new HtmlElementsPlugin({
			 *    headTags: { ... }
			 *  })
			 *
			 *  Means we can use it in the template like this:
			 *  <%= webpackConfig.htmlElements.headTags %>
			 *
			 * Dependencies: HtmlWebpackPlugin
			 */
			new HtmlElementsPlugin({
				headTags: require('./head-config.common')
			}),

			new AngularCompilerPlugin(ngcWebpackConfig.plugin),

			/**
			 * Plugin: WebpackInlineManifestPlugin
			 * Inline Webpack's manifest.js in index.html
			 *
			 * https://github.com/almothafar/webpack-inline-manifest-plugin
			 */
			new WebpackInlineManifestPlugin()
		],

		node: {
			global: true,
			crypto: 'empty',
			process: true,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	};
};
