/**
 * @author: tipe.io
 */
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const ghDeploy = require('./github-deploy');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs

/**
 * Webpack Constants
 */
const GIT_REMOTE_NAME = 'origin';
const COMMIT_MESSAGE = 'Updates';
const GH_REPO_NAME = ghDeploy.getRepoName(GIT_REMOTE_NAME);

module.exports = function(options) {
  const webpackConfigFactory = ghDeploy.getWebpackConfigModule(options); // the settings that are common to prod and dev
  const webpackConfig = webpackConfigFactory(options);

  /**
   * Replace the instance of HtmlWebpackPlugin with an updated one.
   */
  ghDeploy.replaceHtmlWebpackPlugin(webpackConfig.plugins, GH_REPO_NAME);

  return webpackMerge(webpackConfig, {

    output: {
      publicPath: '/' + GH_REPO_NAME + '/' + ghDeploy.safeUrl(webpackConfig.output.publicPath)
    },

    plugins: [
      function() {
        this.plugin('done', function(stats) {
          console.log('Starting deployment to GitHub.');

          const logger = function(msg) {
            console.log(msg);
          };

          const options = {
            logger: logger,
            remote: GIT_REMOTE_NAME,
            message: COMMIT_MESSAGE,
            dotfiles: true // for .nojekyll
          };
         
          fs.writeFileSync(path.join(webpackConfig.output.path, '.nojekyll'), '');

          const ghpages = require('gh-pages');
          ghpages.publish(webpackConfig.output.path, options, function(err) {
            if (err) {
              console.log('GitHub deployment done. STATUS: ERROR.');
              throw err;
            } else {
              console.log('GitHub deployment done. STATUS: SUCCESS.');
            }
          });
        });
      }
    ]
  });
};
