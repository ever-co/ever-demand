'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
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
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var maintenanceInfo;
			return tslib_1.__generator(this, function(_a) {
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
			return tslib_1.__awaiter(_this, void 0, void 0, function() {
				var maintenanceInfo, apiInfo, appInfo, maintenanceMode, error_1;
				return tslib_1.__generator(this, function(_a) {
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
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var maintenanceInfo, error_2;
			return tslib_1.__generator(this, function(_a) {
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
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var maintenanceInfo, apiStatus, appStatus, error_3;
			return tslib_1.__generator(this, function(_a) {
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
	MaintenanceService = tslib_1.__decorate(
		[
			core_1.Injectable(),
			tslib_1.__metadata('design:paramtypes', [http_1.HttpClient])
		],
		MaintenanceService
	);
	return MaintenanceService;
})();
exports.MaintenanceService = MaintenanceService;
//# sourceMappingURL=maintenance.service.js.map
