import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_ICONS } from './icons';

// Same camelCase -> kebab-case mapping as ionicons' addIcons().
const kebab = (name: string) =>
	name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z0-9])/g, '$1-$2').toLowerCase();

function sources(dir: string): string[] {
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
	for (const file of sources(join(process.cwd(), 'src'))) {
		const text = readFileSync(file, 'utf8');
		for (const tag of text.matchAll(/<ion-icon\b[^>]*>/g)) {
			const attr = /\s(?:name|\[name\])="([^"]*)"/.exec(tag[0]);
			if (!attr) continue;
			const literals = attr[1].includes("'")
				? [...attr[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1])
				: [attr[1]];
			literals.forEach((name) => found.set(name, file));
		}
	}
	return found;
}

describe('app icons', () => {
	it('registers every ionicon the templates use', () => {
		const registered = new Set(Object.keys(APP_ICONS).map(kebab));
		const used = iconsInTemplates();

		expect(used.size).toBeGreaterThan(0);
		const missing = [...used].filter(([name]) => !registered.has(name));
		expect(missing).toEqual([]);
	});
});
