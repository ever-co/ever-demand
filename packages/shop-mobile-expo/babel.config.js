// babel-preset-expo adds the react-native-worklets (Reanimated 4) plugin by itself.
module.exports = function (api) {
	api.cache(true);
	return {
		presets: ['babel-preset-expo'],
	};
};
