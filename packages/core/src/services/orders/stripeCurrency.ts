/**
 * Currency used for charges when the operator did not configure one.
 * Kept equal to the value that used to be hard-coded, so existing
 * installations charge exactly as before.
 */
export const DEFAULT_STRIPE_CURRENCY = 'ils';

/**
 * Currencies whose smallest unit is not 1/100 of the major unit. Order
 * totals are converted to minor units with a factor of 100
 * (see `toStripeAmountInCents`), so charging in one of these would bill
 * the customer the wrong amount. They are rejected until the conversion
 * knows about them.
 */
const NON_TWO_DECIMAL_CURRENCIES: ReadonlySet<string> = new Set([
	// zero-decimal
	'bif',
	'clp',
	'djf',
	'gnf',
	'jpy',
	'kmf',
	'krw',
	'mga',
	'pyg',
	'rwf',
	'ugx',
	'vnd',
	'vuv',
	'xaf',
	'xof',
	'xpf',
	// three-decimal
	'bhd',
	'iqd',
	'jod',
	'kwd',
	'lyd',
	'omr',
	'tnd',
]);

/**
 * Normalizes the configured charge currency to the lower-case ISO 4217 code
 * the payment provider expects.
 *
 * An unset or blank value gives the default, so the setting stays optional.
 *
 * @param {unknown} value raw value of the currency setting
 * @returns {string} three lower-case letters, e.g. `usd`
 * @throws {Error} when the value is not a three-letter code, or the currency
 * is not split into 100 minor units
 */
export function resolveStripeCurrency(value: unknown): string {
	if (value == null) {
		return DEFAULT_STRIPE_CURRENCY;
	}

	if (typeof value !== 'string') {
		throw new Error(
			`Invalid charge currency ${String(value)}: it must be a three-letter currency code!`
		);
	}

	const currency = value.trim().toLowerCase();

	if (currency === '') {
		return DEFAULT_STRIPE_CURRENCY;
	}

	if (!/^[a-z]{3}$/.test(currency)) {
		throw new Error(
			`Invalid charge currency "${value}": it must be a three-letter currency code, e.g. usd!`
		);
	}

	if (NON_TWO_DECIMAL_CURRENCIES.has(currency)) {
		throw new Error(
			`Charge currency "${currency}" is not supported: it is not split into 100 minor units!`
		);
	}

	return currency;
}
