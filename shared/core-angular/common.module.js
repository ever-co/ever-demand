'use strict';
var __decorate =
	(this && this.__decorate) ||
	function(decorators, target, key, desc) {
		var c = arguments.length,
			r =
				c < 3
					? target
					: desc === null
					? (desc = Object.getOwnPropertyDescriptor(target, key))
					: desc,
			d;
		if (
			typeof Reflect === 'object' &&
			typeof Reflect.decorate === 'function'
		)
			r = Reflect.decorate(decorators, target, key, desc);
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i]))
					r =
						(c < 3
							? d(r)
							: c > 3
							? d(target, key, r)
							: d(target, key)) || r;
		return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
Object.defineProperty(exports, '__esModule', { value: true });
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
	CommonModule = CommonModule_1 = __decorate(
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
