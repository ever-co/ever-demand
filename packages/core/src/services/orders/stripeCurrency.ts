/**
 * Currency of card charges when `STRIPE_CURRENCY` is unset or blank: the
 * currency every charge used before the setting existed.
 */
export const DEFAULT_STRIPE_CURRENCY = 'ils';

/**
 * Currencies whose amounts can not be sent as the order total times 100.
 * Order totals are converted to minor units with a factor of 100
 * (see `toStripeAmountInCents`), so charging in one of these would bill
 * the customer the wrong amount, or Stripe would refuse the amount.
 * They are rejected until the conversion knows about them.
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
	'vnd',
	'vuv',
	'xaf',
	'xof',
	'xpf',
	// charged in whole units: amounts must be divisible by 100
	'isk',
	'ugx',
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
 * @throws {TypeError} when the value is not a string
 * @throws {Error} when the value is not a three-letter code, or the currency
 * is not split into 100 minor units
 */
export function resolveStripeCurrency(value: unknown): string {
	if (value == null) {
		return DEFAULT_STRIPE_CURRENCY;
	}

	if (typeof value !== 'string') {
		throw new TypeError(
			`Invalid charge currency of type ${typeof value}: it must be a three-letter currency code!`
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

/**
 * Idempotency key of the card charge of one order with one card.
 *
 * Stripe refuses a key sent again with other parameters, so the key holds
 * the currency: a retry after the currency setting changed gets a new key
 * instead of an error, and the `isPaid` check still refuses a paid order.
 * The default currency keeps the key used before the setting existed, so
 * a retry across the upgrade still gets the charge of its first attempt.
 *
 * @param {string} orderId order to charge
 * @param {string} cardId card to charge
 * @param {string} currency resolved charge currency, e.g. `usd`
 * @returns {string} the idempotency key
 */
export function stripeChargeIdempotencyKey(
	orderId: string,
	cardId: string,
	currency: string
): string {
	const key = `order-${orderId}-card-${cardId}`;

	return currency === DEFAULT_STRIPE_CURRENCY ? key : `${key}-${currency}`;
}
