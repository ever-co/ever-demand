// Serves the production build (`dist/`) as static files, for smoke and e2e runs without the
// dev server (a plain node:http server; the Docker image serves the same files with nginx).
//
// Usage: node scripts/serve-build.ts [--port=4200] [--dir=dist]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	options: {
		port: { type: 'string', default: process.env.PORT ?? '4200' },
		dir: { type: 'string', default: 'dist' },
	},
	strict: false,
});

const root = resolve(String(values.dir));
const port = Number(values.port);

const TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.eot': 'application/vnd.ms-fontobject',
	'.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
	console.error(`No index.html in ${root}: run "pnpm build" first.`);
	process.exit(1);
}

createServer((req, res) => {
	const url = new URL(req.url ?? '/', 'http://localhost');
	let file = normalize(join(root, decodeURIComponent(url.pathname)));
	if (!file.startsWith(root + sep) && file !== root) {
		res.writeHead(403).end();
		return;
	}
	if (!existsSync(file) || statSync(file).isDirectory()) {
		// the admin uses hash routing, but fall back to index.html like nginx's try_files
		file = join(root, 'index.html');
	}
	res.writeHead(200, {
		'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
	});
	createReadStream(file).pipe(res);
}).listen(port, () => {
	console.log(`Serving ${root} on http://localhost:${port}`);
});
