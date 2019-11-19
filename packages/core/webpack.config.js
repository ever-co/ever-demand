const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isProduction =
	typeof process.env.NODE_ENV !== 'undefined' &&
	process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';
const devtool = isProduction ? false : 'inline-source-map';

console.log('The custom config is used now');

module.exports = {
	entry: ['webpack/hot/poll?100', './src/nest-bootstrap.ts'],
	watch: false,
	target: 'node',
	externals: [
		nodeExternals({
			whitelist: ['webpack/hot/poll?100', '@ever-platform/common']
		})
	],
	module: {
		rules: [
			{
				test: /\.graphql?$/,
				loader: 'webpack-graphql-loader'
			},
			{
				test: /.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	mode,
	devtool,
	resolve: {
		modules: ['node_modules'],
		extensions: ['.tsx', '.ts', '.js'],
		symlinks: true,
		alias: {
			'@modules': path.resolve('./node_modules/@ever-platform/common/'),
			'@pyro/io': path.resolve('./src/@pyro/io'),
			'@pyro/db-server': path.resolve('./src/@pyro/db-server'),
			'@pyro': path.resolve('./node_modules/@ever-platform/common/@pyro/')
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
		// new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
		// new ForkTsCheckerWebpackPlugin({ tslint: true })
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'server.js'
	}
};
