'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var core_1 = require('@angular/core');
var GoogleMapsLoader = /** @class */ (function() {
	function GoogleMapsLoader() {}
	GoogleMapsLoader.prototype.load = function(googleMapsApiKey) {
		var _this = this;
		var src =
			'https://maps.googleapis.com/maps/api/js?key=' +
			googleMapsApiKey +
			'&libraries=places,drawing&callback=__onGoogleLoaded';
		return new Promise(function(resolve, reject) {
			return tslib_1.__awaiter(_this, void 0, void 0, function() {
				var node;
				return tslib_1.__generator(this, function(_a) {
					window['__onGoogleLoaded'] = function(ev) {
						resolve('google maps api loaded');
					};
					node = document.createElement('script');
					node.src = src;
					node.type = 'text/javascript';
					document.getElementsByTagName('head')[0].appendChild(node);
					return [2 /*return*/];
				});
			});
		});
	};
	GoogleMapsLoader = tslib_1.__decorate(
		[core_1.Injectable(), tslib_1.__metadata('design:paramtypes', [])],
		GoogleMapsLoader
	);
	return GoogleMapsLoader;
})();
exports.GoogleMapsLoader = GoogleMapsLoader;
//# sourceMappingURL=googleMapsLoader.js.map
