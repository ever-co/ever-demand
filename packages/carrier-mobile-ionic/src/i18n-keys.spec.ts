import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');

// Every language the carrier can pick (assets/i18n/<lang>.json).
const LOCALES = ['bg', 'en', 'es', 'fr', 'he', 'ru'];

// The order banners, the drive-to-warehouse labels, the login fields and the alerts.
const KEYS = [
	'COMMON.OK',
	'COMMON.TRY_AGAIN',
	'ORDER_STATE.CUSTOMER_CANCELLED_ORDER',
	'ORDER_STATE.TAKEN_BY_ANOTHER_CARRIER',
	'DRIVE_TO_WAREHOUSE_VIEW.TO',
	'DRIVE_TO_WAREHOUSE_VIEW.ORDER_ID',
	'LOGIN_VIEW.USERNAME',
	'LOGIN_VIEW.PASSWORD',
	'LOGIN_VIEW.WRONG_CREDENTIALS',
];

// English text the templates used to show to every carrier, whatever the language.
const HARD_CODED = [
	'TODO add translate',
	'The customer cancel order',
	'Another Carrier took the order first',
	'>To: {{',
	'Order ID: {{',
	'placeholder="Username"',
	'placeholder="Password"',
];

// fr.json entries that may read the same as en.json: codes, not text.
const SAME_IN_FRENCH = [
	'CURRENT_DIRECTION',
	'SIDEBAR_SIDE',
	'DELIVERY_VIEW.ID',
	'COMMON.OK',
];

const messagesIn = (lang: string): any =>
	JSON.parse(
		readFileSync(join(SRC, 'assets', 'i18n', `${lang}.json`), 'utf8'),
	);

const lookup = (messages: any, key: string): unknown =>
	key.split('.').reduce((node, part) => node?.[part], messages);

/** Every dotted key with a text value, e.g. 'DELIVERY_VIEW.TO'. */
const leafKeys = (node: any, prefix = ''): string[] =>
	Object.entries(node).flatMap(([name, value]) =>
		typeof value === 'object' && value !== null
			? leafKeys(value, `${prefix}${name}.`)
			: [`${prefix}${name}`],
	);

// A quoted key piped into translate: {{ 'A.B' | translate }}, [x]="'A.B' | translate".
const TRANSLATED_LITERAL =
	/'([^']+)'\s*\|\s*translate\b|"([^"]+)"\s*\|\s*translate\b/g;

/** App sources with the given extension, without the specs. */
function sources(extension: string, dir = SRC): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sources(extension, path);
		return entry.name.endsWith(extension) &&
			!entry.name.endsWith('.spec.ts')
			? [path]
			: [];
	});
}

/** The templates: every .html file and the inline `template:` of a component. */
function templates(): { file: string; text: string }[] {
	const html = sources('.html').map((file) => ({
		file,
		text: readFileSync(file, 'utf8'),
	}));
	const inline = sources('.ts').flatMap((file) =>
		[...readFileSync(file, 'utf8').matchAll(/template:\s*`([^`]*)`/g)].map(
			(match) => ({ file, text: match[1] }),
		),
	);
	return [...html, ...inline];
}

/** Each literal key a template passes to the translate pipe, with where it is used. */
function translatedKeys(): Map<string, string[]> {
	const keys = new Map<string, string[]>();
	for (const { file, text } of templates()) {
		for (const match of text.matchAll(TRANSLATED_LITERAL)) {
			const key = match[1] ?? match[2];
			keys.set(key, [...(keys.get(key) ?? []), relative(SRC, file)]);
		}
	}
	return keys;
}

describe('carrier translations', () => {
	it('finds the translate pipe keys in the html and the inline templates', () => {
		const keys = translatedKeys();

		expect(keys.size).toBeGreaterThan(40);
		expect([...keys.keys()]).toEqual(
			expect.arrayContaining([
				'MENU.MAIN',
				'LOGIN_VIEW.USERNAME',
				"DRIVE_TO_WAREHOUSE_VIEW.I'M_THERE",
				'DELIVERY_VIEW.DETAILS',
				'NO_INTERNET_VIEW.NETWORK_WAS_DISCONNECTED',
			]),
		);
	});

	for (const lang of LOCALES) {
		it(`${lang}.json has every key the templates translate`, () => {
			const messages = messagesIn(lang);

			const missing = [...translatedKeys()]
				.filter(([key]) => {
					const value = lookup(messages, key);
					return typeof value !== 'string' || value.trim() === '';
				})
				.map(([key, files]) => `${key} (${files.join(', ')})`);

			expect(missing).toEqual([]);
		});
	}

	it('fr.json has no English text left from en.json', () => {
		const en = messagesIn('en');
		const fr = messagesIn('fr');

		const english = leafKeys(en).filter(
			(key) =>
				!SAME_IN_FRENCH.includes(key) &&
				lookup(fr, key) === lookup(en, key),
		);

		expect(english).toEqual([]);
	});

	for (const lang of LOCALES) {
		it(`${lang}.json has the order, login and alert messages`, () => {
			const messages = messagesIn(lang);

			const missing = KEYS.filter((key) => {
				const value = lookup(messages, key);
				return typeof value !== 'string' || value.trim() === '';
			});

			expect(missing).toEqual([]);
		});
	}

	it('templates show no hard-coded English banner, label or field', () => {
		const offenders = sources('.html').flatMap((file) => {
			const text = readFileSync(file, 'utf8');
			return HARD_CODED.filter((english) => text.includes(english)).map(
				(english) => `${relative(SRC, file)}: ${english}`,
			);
		});

		expect(offenders).toEqual([]);
	});

	it("templates translate the OK button with COMMON.OK, not the missing 'OK' key", () => {
		const offenders = sources('.html')
			.filter((file) =>
				/'OK'\s*\|\s*translate/.test(readFileSync(file, 'utf8')),
			)
			.map((file) => relative(SRC, file));

		expect(offenders).toEqual([]);
	});

	it('alerts show translated text, not an English literal', () => {
		const offenders = sources('.ts').flatMap((file) =>
			[
				...readFileSync(file, 'utf8').matchAll(
					/alert\(\s*['"`][^)]*\)/g,
				),
			].map((call) => `${relative(SRC, file)}: ${call[0]}`),
		);

		expect(offenders).toEqual([]);
	});
});
