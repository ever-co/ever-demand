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
var __metadata =
	(this && this.__metadata) ||
	function(k, v) {
		if (
			typeof Reflect === 'object' &&
			typeof Reflect.metadata === 'function'
		)
			return Reflect.metadata(k, v);
	};
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: new P(function(resolve) {
							resolve(result.value);
					  }).then(fulfilled, rejected);
			}
			step(
				(generator = generator.apply(thisArg, _arguments || [])).next()
			);
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: []
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] ||
									  ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys),
								(t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (
								op[0] === 3 &&
								(!t || (op[1] > t[0] && op[1] < t[3]))
							) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@angular/core');
var http_1 = require('@angular/common/http');
var operators_1 = require('rxjs/operators');
var MaintenanceTypes;
(function(MaintenanceTypes) {
	MaintenanceTypes['ShopMobile'] = 'shop-mobile';
	MaintenanceTypes['ShopWeb'] = 'shop-web';
	MaintenanceTypes['CarrierMobile'] = 'carrier-mobile';
	MaintenanceTypes['MerchantTablet'] = 'merchant-tablet';
	MaintenanceTypes['Admin'] = 'admin';
	MaintenanceTypes['Api'] = 'api';
})(
	(MaintenanceTypes =
		exports.MaintenanceTypes || (exports.MaintenanceTypes = {}))
);
var MaintenanceService = /** @class */ (function() {
	function MaintenanceService(http) {
		this.http = http;
		this.headers = new http_1.HttpHeaders({
			'Content-Type': 'application/json'
		});
	}
	MaintenanceService.prototype.getMaintenanceInfo = function(
		maintenanceApiUrl
	) {
		return __awaiter(this, void 0, void 0, function() {
			var maintenanceInfo;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							this.http
								.get(maintenanceApiUrl, {
									headers: this.headers
								})
								.pipe(operators_1.first())
								.toPromise()
						];
					case 1:
						maintenanceInfo = _a.sent();
						return [2 /*return*/, maintenanceInfo['maintenance']];
				}
			});
		});
	};
	MaintenanceService.prototype.load = function(appTyle, maintenanceApiUrl) {
		var _this = this;
		return new Promise(function(resolve, reject) {
			return __awaiter(_this, void 0, void 0, function() {
				var maintenanceInfo, apiInfo, appInfo, maintenanceMode, error_1;
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0:
							_a.trys.push([0, 3, , 4]);
							return [
								4 /*yield*/,
								this.getMaintenanceInfo(maintenanceApiUrl)
							];
						case 1:
							maintenanceInfo = _a.sent();
							return [
								4 /*yield*/,
								maintenanceInfo.find(function(m) {
									return (
										m.type === MaintenanceTypes.Api &&
										m.status
									);
								})
							];
						case 2:
							apiInfo = _a.sent();
							appInfo = maintenanceInfo.find(function(m) {
								return m.type === appTyle && m.status;
							});
							maintenanceMode = apiInfo || appInfo;
							if (maintenanceMode) {
								localStorage.setItem(
									'maintenanceMode',
									maintenanceMode.type
								);
							} else {
								localStorage.removeItem('maintenanceMode');
							}
							resolve(true);
							return [3 /*break*/, 4];
						case 3:
							error_1 = _a.sent();
							localStorage.removeItem('maintenanceMode');
							resolve(true);
							return [3 /*break*/, 4];
						case 4:
							return [2 /*return*/];
					}
				});
			});
		});
	};
	MaintenanceService.prototype.getMessage = function(
		type,
		maintenanceApiUrl
	) {
		return __awaiter(this, void 0, void 0, function() {
			var maintenanceInfo, error_2;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						_a.trys.push([0, 2, , 3]);
						return [
							4 /*yield*/,
							this.getMaintenanceInfo(maintenanceApiUrl)
						];
					case 1:
						maintenanceInfo = _a.sent();
						return [
							2 /*return*/,
							maintenanceInfo.find(function(m) {
								return m.type === type;
							}).message
						];
					case 2:
						error_2 = _a.sent();
						return [3 /*break*/, 3];
					case 3:
						return [2 /*return*/];
				}
			});
		});
	};
	MaintenanceService.prototype.getStatus = function(type, maintenanceApiUrl) {
		return __awaiter(this, void 0, void 0, function() {
			var maintenanceInfo, apiStatus, appStatus, error_3;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						_a.trys.push([0, 2, , 3]);
						return [
							4 /*yield*/,
							this.getMaintenanceInfo(maintenanceApiUrl)
						];
					case 1:
						maintenanceInfo = _a.sent();
						apiStatus = maintenanceInfo.find(function(m) {
							return m.type === MaintenanceTypes.Api;
						}).status;
						appStatus = maintenanceInfo.find(function(m) {
							return m.type === type;
						}).status;
						return [2 /*return*/, apiStatus && appStatus];
					case 2:
						error_3 = _a.sent();
						return [3 /*break*/, 3];
					case 3:
						return [2 /*return*/];
				}
			});
		});
	};
	var _a;
	MaintenanceService = __decorate(
		[
			core_1.Injectable(),
			__metadata('design:paramtypes', [
				(typeof (_a =
					typeof http_1.HttpClient !== 'undefined' &&
					http_1.HttpClient) === 'function' &&
					_a) ||
					Object
			])
		],
		MaintenanceService
	);
	return MaintenanceService;
})();
exports.MaintenanceService = MaintenanceService;
//# sourceMappingURL=maintenance.service.js.map
