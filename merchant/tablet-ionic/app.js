var connect = require('connect');
var path = require('path');
var serveStatic = require('serve-static');
var port = 8080;
connect().use(serveStatic(path.join(__dirname, 'www'))).listen(port);
console.log("listening on " + port);
//# sourceMappingURL=app.js.map