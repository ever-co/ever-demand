import {
	DEFAULT_STRIPE_CURRENCY,
	resolveStripeCurrency,
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
		for (const value of ['us', 'usdd', 'u$d', '123', 'us d', 5, {}, true]) {
			expect(() => resolveStripeCurrency(value)).toThrow(
				/Invalid charge currency/
			);
		}
	});

	it('rejects currencies the cents conversion would bill wrongly', () => {
		for (const value of ['jpy', 'JPY', 'krw', 'vnd', 'kwd', 'bhd']) {
			expect(() => resolveStripeCurrency(value)).toThrow(/not supported/);
		}
	});
});
