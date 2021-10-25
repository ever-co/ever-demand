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
	stats: {
		env: true,
		errors: true,
		errorDetails: true,
		errorStack: true,
		outputPath: true,
		publicPath: true,
		entrypoints: true,
		chunkGroups: true,		
		chunks: true,		
		modules: true,
		moduleTrace: true,
		children: true,
		logging: 'verbose',
		loggingTrace: true,		
		assets: true,
	},
	entry: ['./src/nest-bootstrap.ts'],
	watch: false,
	optimization: {
        concatenateModules: false,
		minimize: false,		
    },
	externals: [
		nodeExternals({
			modulesDir: path.resolve(__dirname, '../../node_modules'),
		}),
	],	
	target: 'node',
	module: {
		rules: [
			{
				test: /\.graphql?$/,
				loader: 'webpack-graphql-loader',
			},
			{
				test: /\.mjs$/,
				include: /node_modules/,
				type: 'javascript/auto',
			},
			{
				test: /\.(ts|tsx)?$/,
				loader: 'ts-loader',
				options: {  transpileOnly: true, allowTsInNodeModules: true }
			},
		],
	},
	mode,
	devtool,
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		symlinks: false,
		alias: {
			'@modules/server.common': path.resolve(
				'../../node_modules/@ever-platform/common/src'
			),
			'@pyro/io': path.resolve('./src/@pyro/io'),
			'@pyro/db-server': path.resolve('./src/@pyro/db-server'),
			'@pyro': path.resolve(
				'../../node_modules/@ever-platform/common/src/@pyro/'
			),
		},
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		// new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
		// new ForkTsCheckerWebpackPlugin({ tslint: true })
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'server.js',
	},
};
