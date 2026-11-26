// Serves the `expo export --platform web` output (dist/) with a single-page-app fallback, for the
// Playwright e2e suite and quick checks: `node scripts/serve-web.mjs [port]` (default 8081).
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 8081);
const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.ttf': 'font/ttf',
	'.woff2': 'font/woff2',
};

if (!existsSync(join(root, 'index.html'))) {
	console.error(`No web build in ${root}: run \`pnpm export:web\` first.`);
	process.exit(1);
}

createServer((req, res) => {
	const path = normalize(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname)).replace(/^[\\/]+/, '');
	let file = join(root, path);
	if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
		file = join(root, 'index.html');
	}
	res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
	createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Ever shop (Expo web) on http://localhost:${port}`));
