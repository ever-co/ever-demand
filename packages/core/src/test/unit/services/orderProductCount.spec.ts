import {
	assertValidOrderProductCount,
	assertValidOrderProductCounts,
	MAX_ORDER_PRODUCT_COUNT,
} from '../../../services/warehouses/orderProductCount';

describe('assertValidOrderProductCount', () => {
	it('keeps accepting ordinary whole-number quantities', () => {
		for (const count of [1, 2, 10, 250, MAX_ORDER_PRODUCT_COUNT]) {
			expect(() => assertValidOrderProductCount(count, 'p1')).not.toThrow();
		}
	});

	it('rejects zero and negative quantities', () => {
		for (const count of [0, -1, -100]) {
			expect(() => assertValidOrderProductCount(count, 'p1')).toThrow(
				/Invalid quantity/
			);
		}
	});

	it('rejects quantities above the upper bound', () => {
		expect(() =>
			assertValidOrderProductCount(MAX_ORDER_PRODUCT_COUNT + 1, 'p1')
		).toThrow(/Invalid quantity/);
		expect(() =>
			assertValidOrderProductCount(Number.MAX_SAFE_INTEGER, 'p1')
		).toThrow(/Invalid quantity/);
	});

	it('rejects fractional, non-finite and non-numeric quantities', () => {
		for (const count of [
			1.5,
			NaN,
			Infinity,
			-Infinity,
			'2',
			null,
			undefined,
			{},
		]) {
			expect(() => assertValidOrderProductCount(count, 'p1')).toThrow(
				/Invalid quantity/
			);
		}
	});

	it('names the offending product in the error', () => {
		expect(() => assertValidOrderProductCount(-1, 'product-42')).toThrow(
			/product-42/
		);
	});
});

describe('assertValidOrderProductCounts', () => {
	it('accepts an empty list and a list of valid counts', () => {
		expect(() => assertValidOrderProductCounts([])).not.toThrow();
		expect(() =>
			assertValidOrderProductCounts([
				{ productId: 'p1', count: 1 },
				{ productId: 'p2', count: MAX_ORDER_PRODUCT_COUNT },
			])
		).not.toThrow();
	});

	it('throws when one entry of several has an invalid count', () => {
		expect(() =>
			assertValidOrderProductCounts([
				{ productId: 'p1', count: 2 },
				{ productId: 'p2', count: 0 },
				{ productId: 'p3', count: 3 },
			])
		).toThrow(/Invalid quantity/);
	});

	it("names the offending entry's productId", () => {
		expect(() =>
			assertValidOrderProductCounts([
				{ productId: 'p1', count: 2 },
				{ productId: 'product-77', count: 0 },
			])
		).toThrow(/product-77/);
	});
});
