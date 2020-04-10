require('dotenv').config();
var pm2 = require('pm2');
var MACHINE_NAME = process.env.KEYMETRICS_MACHINE_NAME;
var PRIVATE_KEY = process.env.KEYMETRICS_SECRET_KEY;
var PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;
var appName = process.env.PM2_APP_NAME;
var instances = process.env.WEB_CONCURRENCY || 1;
var maxMemory = process.env.WEB_MEMORY || 2048;
pm2.connect(function () {
    pm2.start({
        script: 'app.js',
        name: appName,
        exec_mode: 'cluster',
        instances: instances,
        max_memory_restart: maxMemory + 'M',
        env: {
            NODE_ENV: 'production',
            PORT: '8080',
            KEYMETRICS_PUBLIC: PUBLIC_KEY,
            KEYMETRICS_SECRET: PRIVATE_KEY
        },
        post_update: ['yarn install']
    }, function () {
        pm2.launchBus(function (err, bus) {
            console.log('[PM2] Log streaming started');
            bus.on('log:out', function (packet) {
                console.log('[App:%s] %s', packet.process.name, packet.data);
            });
            bus.on('log:err', function (packet) {
                console.error('[App:%s][Err] %s', packet.process.name, packet.data);
            });
        });
    });
});
//# sourceMappingURL=pm2bootstrap.js.map