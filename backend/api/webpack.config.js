const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

console.log('The custom config is used');

module.exports = {
	entry: ['webpack/hot/poll?100', './src/nest-bootstrap.ts'],
	watch: false,
	target: 'node',
	externals: [
		nodeExternals({
			whitelist: ['webpack/hot/poll?100']
		})
	],
	module: {
		rules: [
			{ test: /\.graphql?$/, loader: 'webpack-graphql-loader' },
			{
				test: /.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	mode: 'development',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		symlinks: false,
		alias: {
			'@modules': path.resolve('./src/modules/'),
			'@pyro/io': path.resolve('./src/@pyro/io'),
			'@pyro/db-server': path.resolve('./src/@pyro/db-server'),
			'@pyro': path.resolve('./src/modules/server.common/@pyro/')
		}
	},
	plugins: [new webpack.HotModuleReplacementPlugin()],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'server.js'
	}
};
