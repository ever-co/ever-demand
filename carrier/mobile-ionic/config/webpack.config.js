const path = require('path');
const useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

const env = process.env.IONIC_ENV;

if (env === 'prod' || env === 'dev') {
	useDefaultConfig[env].resolve.alias = {
		'@pyro': path.resolve('./src/modules/server.common/@pyro/'),
		'@modules': path.resolve('./src/modules/'),
		mongoose: path.resolve(
			'./src/modules/client.common.angular2/mongoose-placeholder.ts'
		),
		typeorm: path.resolve(
			'./src/modules/client.common.angular2/typeorm-placeholder.ts'
		)
		//"@env": path.resolve(environmentPath()),
	};

	useDefaultConfig[env].resolve.symlinks = false;
} else {
	// Default to dev config
	useDefaultConfig[env] = useDefaultConfig.dev;
	useDefaultConfig[env].resolve.alias = {
		'@pyro': path.resolve('./src/modules/server.common/@pyro/'),
		'@modules': path.resolve('./src/modules/'),
		mongoose: path.resolve(
			'./src/modules/client.common.angular2/mongoose-placeholder.ts'
		),
		typeorm: path.resolve(
			'./src/modules/client.common.angular2/typeorm-placeholder.ts'
		)
		//"@env": path.resolve(environmentPath()),
	};

	useDefaultConfig[env].resolve.symlinks = false;
}

module.exports = function() {
	console.log('The custom config is used');
	return useDefaultConfig;
};
