import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { APP_ICONS } from './icons';

const SRC = join(process.cwd(), 'src');

// Same camelCase -> kebab-case mapping as ionicons' addIcons().
const kebab = (name: string) =>
	name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z0-9])/g, '$1-$2').toLowerCase();

/** App sources (templates and TypeScript), without the specs. */
function sources(dir = SRC): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sources(path);
		return /\.(html|ts)$/.test(entry.name) && !entry.name.endsWith('.spec.ts')
			? [path]
			: [];
	});
}

/** Icon names of every `<ion-icon name="...">` / `[name]="'...'"` in the app templates. */
function iconsInTemplates(): Map<string, string> {
	const found = new Map<string, string>();
	for (const file of sources()) {
		const text = readFileSync(file, 'utf8');
		for (const tag of text.matchAll(/<ion-icon\b[^>]*>/g)) {
			const attr = /\s(?:name|\[name\])="([^"]*)"/.exec(tag[0]);
			if (!attr) continue;
			const literals = attr[1].includes("'")
				? [...attr[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1])
				: [attr[1]];
			literals.forEach((name) => found.set(name, relative(SRC, file)));
		}
	}
	return found;
}

describe('standalone Ionic', () => {
	it('registers every ionicon the templates use', () => {
		const registered = new Set(Object.keys(APP_ICONS).map(kebab));
		const used = iconsInTemplates();

		expect(used.size).toBeGreaterThan(0);
		const missing = [...used].filter(([name]) => !registered.has(name));
		expect(missing).toEqual([]);
	});

	it('imports Ionic through its per-component entry points', () => {
		// `@ionic/angular/lazy` is the deprecated IonicModule build. The `@ionic/angular` barrel
		// works, but one import of it in the eagerly loaded code puts every Ionic component the
		// app uses into the main bundle; `@ionic/angular/ion-button`, `.../modal-controller`, ...
		// keep each component in the lazy chunk of the page that uses it.
		const offenders = sources()
			.filter((file) => file.endsWith('.ts'))
			.filter((file) =>
				/from\s*['"]@ionic\/angular(\/lazy)?['"]/.test(readFileSync(file, 'utf8'))
			)
			.map((file) => relative(SRC, file));
		expect(offenders).toEqual([]);
	});
});
