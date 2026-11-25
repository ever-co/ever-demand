import {
	DEFAULT_STRIPE_CURRENCY,
	resolveStripeCurrency,
	stripeChargeIdempotencyKey,
} from './stripeCurrency';

describe('resolveStripeCurrency', () => {
	it('keeps the old currency when nothing is configured', () => {
		expect(DEFAULT_STRIPE_CURRENCY).toBe('ils');
		expect(resolveStripeCurrency(undefined)).toBe('ils');
		expect(resolveStripeCurrency(null)).toBe('ils');
		expect(resolveStripeCurrency('')).toBe('ils');
		expect(resolveStripeCurrency('   ')).toBe('ils');
		expect(resolveStripeCurrency('ils')).toBe('ils');
	});

	it('normalizes a configured code to lower case', () => {
		expect(resolveStripeCurrency('usd')).toBe('usd');
		expect(resolveStripeCurrency('EUR')).toBe('eur');
		expect(resolveStripeCurrency(' Gbp ')).toBe('gbp');
	});

	it('rejects values that are not a three-letter code', () => {
		for (const value of ['us', 'usdd', 'u$d', '123', 'us d']) {
			expect(() => resolveStripeCurrency(value)).toThrow(
				/Invalid charge currency/
			);
		}
	});

	it('rejects a value that is not a string with a TypeError naming its type', () => {
		const cases: [unknown, string][] = [
			[5, 'number'],
			[{}, 'object'],
			[[], 'object'],
			[true, 'boolean'],
		];

		for (const [value, type] of cases) {
			expect(() => resolveStripeCurrency(value)).toThrow(TypeError);
			expect(() => resolveStripeCurrency(value)).toThrow(
				`Invalid charge currency of type ${type}`
			);
			expect(() => resolveStripeCurrency(value)).not.toThrow(
				/\[object Object\]/
			);
		}
	});

	it('rejects currencies the cents conversion would bill wrongly', () => {
		for (const value of [
			'jpy',
			'JPY',
			'krw',
			'vnd',
			'xpf',
			'kwd',
			'bhd',
			'isk',
			'ugx',
		]) {
			expect(() => resolveStripeCurrency(value)).toThrow(/not supported/);
		}
	});

	it('accepts currencies Stripe charges with two decimals', () => {
		for (const value of ['usd', 'eur', 'gbp', 'huf', 'twd']) {
			expect(resolveStripeCurrency(value)).toBe(value);
		}
	});
});

describe('stripeChargeIdempotencyKey', () => {
	it('keeps the key used before the setting existed for the default currency', () => {
		expect(stripeChargeIdempotencyKey('order_1', 'card_1', 'ils')).toBe(
			'order-order_1-card-card_1'
		);
	});

	it('gives each currency its own key for one order and card', () => {
		const keys = ['ils', 'usd', 'eur'].map((currency) =>
			stripeChargeIdempotencyKey('order_1', 'card_1', currency)
		);

		expect(keys[1]).toBe('order-order_1-card-card_1-usd');
		expect(new Set(keys).size).toBe(keys.length);
	});
});
