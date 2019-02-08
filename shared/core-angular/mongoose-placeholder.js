'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Schema = /** @class */ (function() {
	function Schema() {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i];
		}
	}
	Schema.prototype.index = function(fields, options) {
		return this;
	};
	Schema.prototype.pre = function() {
		return;
	};
	Schema.prototype.indexes = function() {
		return [];
	};
	return Schema;
})();
exports.Schema = Schema;
exports.Types = {};
//# sourceMappingURL=mongoose-placeholder.js.map
