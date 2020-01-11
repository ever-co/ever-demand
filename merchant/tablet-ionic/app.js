'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var connect = require('connect');
var path = require('path');
var serveStatic = require('serve-static');
var env_1 = require('./scripts/env');
var port = env_1.env.PORT;
connect()
	.use(serveStatic(path.join(__dirname, 'www')))
	.listen(port);
console.log('listening on ' + port);
//# sourceMappingURL=app.js.map
