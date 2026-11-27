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

const messagesIn = (lang: string): any =>
	JSON.parse(
		readFileSync(join(SRC, 'assets', 'i18n', `${lang}.json`), 'utf8'),
	);

const lookup = (messages: any, key: string): unknown =>
	key.split('.').reduce((node, part) => node?.[part], messages);

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

describe('carrier translations', () => {
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
