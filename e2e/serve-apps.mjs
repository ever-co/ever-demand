#!/usr/bin/env node
// Serves the production builds of the web apps on their usual dev ports, with SPA fallback,
// so the Playwright projects can run against real builds (CI and local).
//
//   node e2e/serve-apps.mjs                 # every app whose build output exists
//   node e2e/serve-apps.mjs admin carrier   # only these
//
// Output folders can be overridden with E2E_<NAME>_DIR (e.g. E2E_ADMIN_DIR=/tmp/admin).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const APPS = {
	admin: { port: 4200, dirs: ['packages/admin-web-angular/dist'] },
	'shop-web': { port: 3000, dirs: ['packages/shop-web-angular/dist'] },
	'shop-mobile': { port: 4201, dirs: ['packages/shop-mobile-ionic/www'] },
	merchant: { port: 4202, dirs: ['packages/merchant-tablet-ionic/www'] },
	carrier: { port: 4203, dirs: ['packages/carrier-mobile-ionic/www'] },
	'shop-expo': { port: 8081, dirs: ['packages/shop-mobile-expo/dist'] },
};

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.webmanifest': 'application/manifest+json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.map': 'application/json',
};

/** Finds the folder that holds index.html (Angular's application builder nests it under browser/). */
function findWebRoot(dir) {
	if (!fs.existsSync(dir)) return null;
	if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (!e.isDirectory()) continue;
		const found = findWebRoot(path.join(dir, e.name));
		if (found) return found;
	}
	return null;
}

function serve(name, port, webRoot) {
	const index = path.join(webRoot, 'index.html');
	http
		.createServer((req, res) => {
			let url;
			try {
				url = decodeURIComponent((req.url || '/').split('?')[0]);
			} catch {
				res.writeHead(400).end();
				return;
			}
			// Only files inside the build folder: reject anything that resolves outside it.
			let file = path.resolve(webRoot, '.' + url);
			const rel = path.relative(webRoot, file);
			if (rel.startsWith('..') || path.isAbsolute(rel)) {
				res.writeHead(403).end();
				return;
			}
			if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = index;
			res.writeHead(200, {
				'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
				'cache-control': 'no-store',
			});
			fs.createReadStream(file).pipe(res);
		})
		.listen(port, '127.0.0.1', () => console.log(`${name}: http://localhost:${port} -> ${path.relative(root, webRoot)}`));
}

const wanted = process.argv.slice(2);
let started = 0;
for (const [name, app] of Object.entries(APPS)) {
	if (wanted.length && !wanted.includes(name)) continue;
	const override = process.env[`E2E_${name.toUpperCase().replace(/-/g, '_')}_DIR`];
	const dirs = override ? [override] : app.dirs.map((d) => path.join(root, d));
	const webRoot = dirs.map(findWebRoot).find(Boolean);
	if (!webRoot) {
		console.warn(`${name}: no build output in ${dirs.join(', ')}, skipped`);
		continue;
	}
	serve(name, app.port, webRoot);
	started++;
}
if (!started) {
	console.error('No app build output found.');
	process.exit(1);
}
