import {
	findOrderProductForComment,
	MAX_ORDER_PRODUCT_COMMENT_LENGTH,
} from './orderProductComment';

describe('findOrderProductForComment', () => {
	const order = {
		id: 'order-1',
		products: [{ id: 'line-1' }, { id: 'line-2' }],
	};

	it('returns the product line with the given id', () => {
		expect(findOrderProductForComment(order, 'line-2', 'no onions')).toBe(
			order.products[1]
		);
	});

	it('keeps allowing an empty comment, which clears it', () => {
		expect(findOrderProductForComment(order, 'line-1', '')).toBe(
			order.products[0]
		);
	});

	it('keeps allowing a comment of exactly the maximum length', () => {
		const comment = 'a'.repeat(MAX_ORDER_PRODUCT_COMMENT_LENGTH);
		expect(findOrderProductForComment(order, 'line-1', comment)).toBe(
			order.products[0]
		);
	});

	it('throws a clear error when the order has no such line', () => {
		expect(() => findOrderProductForComment(order, 'nope', 'hi')).toThrow(
			'Order order-1 has no product line with the id nope!'
		);
	});

	it('throws a clear error when the order has no lines at all', () => {
		expect(() =>
			findOrderProductForComment({ id: 'order-2' }, 'line-1', 'hi')
		).toThrow('has no product line');
	});

	it('rejects a comment that is not a string', () => {
		for (const bad of [undefined, null, 5, {}, ['a']]) {
			expect(() =>
				findOrderProductForComment(order, 'line-1', bad)
			).toThrow('Invalid comment');
		}
	});

	it('rejects a comment longer than the maximum', () => {
		const comment = 'a'.repeat(MAX_ORDER_PRODUCT_COMMENT_LENGTH + 1);
		expect(() =>
			findOrderProductForComment(order, 'line-1', comment)
		).toThrow('Invalid comment');
	});
});
