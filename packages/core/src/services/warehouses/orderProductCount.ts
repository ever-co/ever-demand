/**
 * Upper bound for the quantity of a single product line in one order request.
 * It only exists to reject absurd values; ordinary orders are far below it.
 */
export const MAX_ORDER_PRODUCT_COUNT = 10000;

/**
 * The quantity of an ordered product comes straight from the client request,
 * so it must be a whole number between 1 and MAX_ORDER_PRODUCT_COUNT.
 * Without this check a zero or negative quantity would create an order line
 * with a zero/negative total and would *increase* the store's stock instead of
 * decreasing it.
 *
 * @param {unknown} count requested quantity
 * @param {string} productId product the quantity belongs to (used in the error message)
 * @throws {Error} when the quantity is not an integer in the allowed range
 */
export function assertValidOrderProductCount(
	count: unknown,
	productId: string
): void {
	if (
		typeof count !== 'number' ||
		!Number.isInteger(count) ||
		count < 1 ||
		count > MAX_ORDER_PRODUCT_COUNT
	) {
		throw new Error(
			`Invalid quantity for the product with the id ${productId}: it must be a whole number between 1 and ${MAX_ORDER_PRODUCT_COUNT}!`
		);
	}
}

/**
 * Checks the quantity of every product in an order request.
 *
 * @param {Array<{ count: unknown; productId: string }>} products requested products
 * @throws {Error} when any quantity is not an integer in the allowed range
 */
export function assertValidOrderProductCounts(
	products: Array<{ count: unknown; productId: string }>
): void {
	for (const p of products) {
		assertValidOrderProductCount(p.count, p.productId);
	}
}
