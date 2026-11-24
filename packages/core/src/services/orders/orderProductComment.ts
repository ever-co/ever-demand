/**
 * Upper bound for the length of the comment a customer leaves on one product
 * line of an order. It only exists to reject absurd values.
 */
export const MAX_ORDER_PRODUCT_COMMENT_LENGTH = 1000;

/**
 * Finds the product line of an order by its line id and checks the comment,
 * both of which come straight from the client request. An empty comment is
 * allowed: it clears the comment.
 *
 * @throws {Error} when the order has no such line, or the comment is not a
 * string of at most MAX_ORDER_PRODUCT_COMMENT_LENGTH characters
 */
export function findOrderProductForComment<T extends { id?: string }>(
	order: { id?: string; products?: T[] },
	productId: string,
	comment: unknown
): T {
	const orderProduct = (order.products || []).find((p) => p.id === productId);

	if (!orderProduct) {
		throw new Error(
			`Order ${order.id} has no product line with the id ${productId}!`
		);
	}

	if (
		typeof comment !== 'string' ||
		comment.length > MAX_ORDER_PRODUCT_COMMENT_LENGTH
	) {
		throw new Error(
			`Invalid comment: it must be text of at most ${MAX_ORDER_PRODUCT_COMMENT_LENGTH} characters!`
		);
	}

	return orderProduct;
}
