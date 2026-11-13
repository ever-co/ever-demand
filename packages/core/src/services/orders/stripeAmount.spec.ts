import {
	MAX_STRIPE_AMOUNT_IN_CENTS,
	toStripeAmountInCents,
} from './stripeAmount';

describe('toStripeAmountInCents', () => {
	it('keeps the old result for whole and exact prices', () => {
		expect(toStripeAmountInCents(1)).toBe(100);
		expect(toStripeAmountInCents(10)).toBe(1000);
		expect(toStripeAmountInCents(12.5)).toBe(1250);
		expect(toStripeAmountInCents(0.01)).toBe(1);
	});

	it('returns whole cents for prices where price * 100 drifts', () => {
		// several of these give a non-integer with a plain `price * 100`
		for (const price of [19.99, 1.15, 4.35, 0.07, 8.2, 33.33]) {
			const cents = toStripeAmountInCents(price);
			expect(Number.isInteger(cents)).toBe(true);
			expect(cents).toBe(Math.round(price * 100));
		}
		expect(19.99 * 100).not.toBe(1999);
		expect(toStripeAmountInCents(19.99)).toBe(1999);
		expect(toStripeAmountInCents(1.15)).toBe(115);
	});

	it('rejects zero, negative and non-finite prices', () => {
		for (const price of [0, -1, -0.01, NaN, Infinity, -Infinity]) {
			expect(() => toStripeAmountInCents(price)).toThrow(/Invalid order price/);
		}
	});

	it('rejects values that are not numbers', () => {
		for (const price of [undefined, null, '10', {}]) {
			expect(() => toStripeAmountInCents(price)).toThrow(/Invalid order price/);
		}
	});

	it('rejects prices that round to zero or exceed the upper bound', () => {
		expect(() => toStripeAmountInCents(0.004)).toThrow(/Invalid order price/);
		expect(toStripeAmountInCents(MAX_STRIPE_AMOUNT_IN_CENTS / 100)).toBe(
			MAX_STRIPE_AMOUNT_IN_CENTS
		);
		expect(() =>
			toStripeAmountInCents(MAX_STRIPE_AMOUNT_IN_CENTS / 100 + 0.01)
		).toThrow(/Invalid order price/);
	});
});
