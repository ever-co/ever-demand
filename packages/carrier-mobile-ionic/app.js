'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var connect_1 = tslib_1.__importDefault(require('connect'));
var path_1 = tslib_1.__importDefault(require('path'));
var serve_static_1 = tslib_1.__importDefault(require('serve-static'));
var env_1 = require('./scripts/env');
var port = env_1.env.PORT;
connect_1
	.default()
	.use(serve_static_1.default(path_1.default.join(__dirname, '../')))
	.listen(port);
console.log('listening on ' + port);
//# sourceMappingURL=app.js.map
