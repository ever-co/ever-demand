/**
 * @author: tipe.io
 */

const helpers = require('./helpers');
const buildUtils = require('./build-utils');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = function (options) {
  const ENV = (process.env.ENV = process.env.NODE_ENV = 'development');
  const HOST = process.env.HOST || 'localhost';
  const PORT = process.env.PORT || 3000;

  const METADATA = Object.assign({}, buildUtils.DEFAULT_METADATA, {
    host: HOST,
    port: PORT,
    ENV: ENV,
    HMR: helpers.hasProcessFlag('hot'),
    PUBLIC: process.env.PUBLIC_DEV || HOST + ':' + PORT
  });

  return webpackMerge(commonConfig({ env: ENV, metadata: METADATA }), {

    mode: 'development',

    devtool: 'cheap-module-source-map',

    output: {
      path: helpers.root('dist'),
      filename: '[name].bundle.js',
      sourceMapFilename: '[file].map',
      chunkFilename: '[id].chunk.js',
      library: 'ac_[name]',
      libraryTarget: 'var'
    },


    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: [helpers.root('src', 'styles')]
        },
        {
          test: /\.scss$/,
          // use: ['style-loader', 'css-loader', 'sass-loader'],
          use: ['style-loader', 'css-loader', {
            loader: 'sass-loader',
            options: { includePaths: ["node_modules"] }
          }],
          include: [helpers.root('src', 'styles')]
        }
      ]
    },


    plugins: [
      new LoaderOptionsPlugin({
        debug: true,
        options: {}
      })
    ],


    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      hot: METADATA.HMR,
      public: METADATA.PUBLIC,
      historyApiFallback: true,
      watchOptions: {
        ignored: /node_modules/
      },
      setup: function (app) { }
    },


    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false,
      fs: 'empty'
    }
  });
};
