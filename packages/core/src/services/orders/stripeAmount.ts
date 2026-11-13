/**
 * Largest amount (in minor units) accepted for a single charge.
 * It matches the upper limit of the payment provider (8 digits) and only
 * exists to reject absurd values before a request is sent.
 */
export const MAX_STRIPE_AMOUNT_IN_CENTS = 99999999;

/**
 * Converts an order price (in major units, e.g. 19.99) into the whole number
 * of minor units (e.g. 1999 cents) that the payment provider requires.
 *
 * A plain `price * 100` gives results such as 1998.9999999999998 for 19.99;
 * the provider rejects non-integer amounts, so the customer could not pay
 * for orders with such prices.
 *
 * @param {unknown} price order total in major units
 * @returns {number} amount in minor units, a whole number >= 1
 * @throws {Error} when the price is not a finite positive number or is too large
 */
export function toStripeAmountInCents(price: unknown): number {
	if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
		throw new Error(
			`Invalid order price ${String(price)}: it must be a positive number!`
		);
	}

	const cents = Math.round(price * 100);

	if (cents < 1 || cents > MAX_STRIPE_AMOUNT_IN_CENTS) {
		throw new Error(
			`Invalid order price ${price}: the amount must be between 0.01 and ${
				MAX_STRIPE_AMOUNT_IN_CENTS / 100
			}!`
		);
	}

	return cents;
}
