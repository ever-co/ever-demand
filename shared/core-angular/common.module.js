'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var core_1 = require('@angular/core');
var lib_1 = require('./lib');
var routers_1 = require('./routers');
var router_1 = require('./lib/router');
var locale_module_1 = require('./locale/locale.module');
var CommonModule = /** @class */ (function() {
	function CommonModule() {}
	CommonModule_1 = CommonModule;
	CommonModule.forRoot = function(options) {
		return {
			ngModule: CommonModule_1,
			providers: [{ provide: router_1.API_URL, useValue: options.apiUrl }]
		};
	};
	var CommonModule_1;
	CommonModule = CommonModule_1 = tslib_1.__decorate(
		[
			core_1.NgModule({
				imports: [
					lib_1.CommonLibModule,
					routers_1.RoutersModule,
					locale_module_1.LocaleModule
				]
			})
		],
		CommonModule
	);
	return CommonModule;
})();
exports.CommonModule = CommonModule;
//# sourceMappingURL=common.module.js.map
