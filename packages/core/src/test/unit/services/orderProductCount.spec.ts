import {
	assertValidOrderProductCount,
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
