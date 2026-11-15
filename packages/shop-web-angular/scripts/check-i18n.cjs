/**
 * Keeps the translation catalogues in step with the reference catalogue.
 *
 * Fails (exit code 1) when a locale in `src/assets/i18n` misses a key of
 * `en-US.json`, or has a key that `en-US.json` does not have.
 *
 * Usage: node scripts/check-i18n.cjs
 *
 * Note: this file is `.cjs` because the package's .gitignore ignores `**\/*.js`
 * (compiled output), which would keep a `.js` script out of version control.
 */
const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const REFERENCE = 'en-US.json';

/** Returns the dotted path of every leaf (string) value of a catalogue. */
function flatten(node, prefix, out) {
	for (const key of Object.keys(node)) {
		const value = node[key];
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === 'object') {
			flatten(value, fullKey, out);
		} else {
			out.push(fullKey);
		}
	}
	return out;
}

function readKeys(file) {
	const content = fs.readFileSync(path.join(I18N_DIR, file), 'utf8');
	return flatten(JSON.parse(content), '', []);
}

const referenceKeys = readKeys(REFERENCE);
const referenceSet = new Set(referenceKeys);
const locales = fs
	.readdirSync(I18N_DIR)
	.filter((file) => file.endsWith('.json') && file !== REFERENCE)
	.sort();

// Refuse to pass vacuously: an empty reference or no locale files means nothing was compared.
if (referenceKeys.length === 0 || locales.length === 0) {
	console.error(
		`Nothing to compare in ${I18N_DIR}: ${referenceKeys.length} reference keys, ${locales.length} locale files.`
	);
	process.exit(1);
}

let failed = false;

for (const locale of locales) {
	const keys = readKeys(locale);
	const keySet = new Set(keys);
	const missing = referenceKeys.filter((key) => !keySet.has(key));
	const extra = keys.filter((key) => !referenceSet.has(key));

	if (missing.length === 0 && extra.length === 0) {
		console.log(`OK    ${locale} (${keys.length} keys)`);
		continue;
	}

	failed = true;
	console.error(`FAIL  ${locale}`);
	missing.forEach((key) => console.error(`  missing: ${key}`));
	extra.forEach((key) => console.error(`  not in ${REFERENCE}: ${key}`));
}

if (failed) {
	console.error(`\nTranslation catalogues are out of step with ${REFERENCE}.`);
	process.exit(1);
}

console.log(`\nAll ${locales.length} catalogues match ${REFERENCE} (${referenceKeys.length} keys).`);
