/**
 * Upper bound for the page size of a products list request.
 * It only exists to reject absurd values; real pages are far smaller.
 */
export const MAX_PRODUCTS_PAGE_LIMIT = 1000;

/**
 * Turns a paging value that came from a request into a whole number
 * between `min` and `max`. Anything that is not a finite number gives `fallback`.
 */
function toBoundedInteger(
	value: unknown,
	min: number,
	max: number,
	fallback: number
): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return fallback;
	}

	return Math.min(Math.max(Math.floor(value), min), max);
}

/**
 * Returns one page of products ordered by sold count (best sellers first).
 *
 * The whole list is ordered BEFORE the page is cut out. Cutting first and
 * ordering afterwards only ordered the products inside each page, so a best
 * seller stored far down the list showed up on a late page instead of the first.
 * Products with the same sold count keep their original relative order.
 *
 * @param {T[]} products all products of a warehouse (not modified)
 * @param {{ skip?: number; limit?: number }} [pagingOptions] page window from the request;
 *   `skip` is clamped to >= 0, `limit` to 1..MAX_PRODUCTS_PAGE_LIMIT; a missing `limit` means "no limit"
 * @returns {T[]} a new array with the requested page
 */
export function paginateBySoldCount<T extends { soldCount?: number }>(
	products: T[],
	pagingOptions: { skip?: number; limit?: number } = {}
): T[] {
	const options = pagingOptions || {};
	const skip = toBoundedInteger(options.skip, 0, Number.MAX_SAFE_INTEGER, 0);
	const hasLimit = typeof options.limit === 'number' && options.limit !== 0;

	const sorted = [...products].sort(
		(a, b) => (b.soldCount || 0) - (a.soldCount || 0)
	);

	if (!hasLimit) {
		return sorted.slice(skip);
	}

	const limit = toBoundedInteger(
		options.limit,
		1,
		MAX_PRODUCTS_PAGE_LIMIT,
		MAX_PRODUCTS_PAGE_LIMIT
	);

	return sorted.slice(skip, skip + limit);
}
