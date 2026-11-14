import {
	MAX_PRODUCTS_PAGE_LIMIT,
	paginateBySoldCount,
} from '../../../services/warehouses/paginateBySoldCount';

// stored order is NOT the sold order: the best seller (p9) is stored last
const stored = [
	{ id: 'p1', soldCount: 1 },
	{ id: 'p2', soldCount: 0 },
	{ id: 'p3', soldCount: 5 },
	{ id: 'p4', soldCount: 2 },
	{ id: 'p5', soldCount: 9 },
	{ id: 'p6', soldCount: 3 },
];

const ids = (products: Array<{ id: string }>) => products.map((p) => p.id);

describe('paginateBySoldCount', () => {
	it('puts the best sellers on the first page, whatever the stored order', () => {
		expect(ids(paginateBySoldCount(stored, { skip: 0, limit: 2 }))).toEqual([
			'p5',
			'p3',
		]);
	});

	it('continues the global order on the next pages', () => {
		expect(ids(paginateBySoldCount(stored, { skip: 2, limit: 2 }))).toEqual([
			'p6',
			'p4',
		]);
		expect(ids(paginateBySoldCount(stored, { skip: 4, limit: 2 }))).toEqual([
			'p1',
			'p2',
		]);
	});

	it('keeps the old result when there is no paging at all', () => {
		const expected = ['p5', 'p3', 'p6', 'p4', 'p1', 'p2'];

		expect(ids(paginateBySoldCount(stored))).toEqual(expected);
		expect(ids(paginateBySoldCount(stored, {}))).toEqual(expected);
		expect(ids(paginateBySoldCount(stored, null as any))).toEqual(expected);
		expect(ids(paginateBySoldCount(stored, { limit: 0, skip: 0 }))).toEqual(
			expected
		);
	});

	it('keeps the old result for skip only and limit only', () => {
		expect(ids(paginateBySoldCount(stored, { skip: 4 }))).toEqual(['p1', 'p2']);
		expect(ids(paginateBySoldCount(stored, { limit: 3 }))).toEqual([
			'p5',
			'p3',
			'p6',
		]);
	});

	it('keeps the stored order for equal sold counts and treats a missing count as 0', () => {
		const products = [
			{ id: 'a', soldCount: 1 },
			{ id: 'b' },
			{ id: 'c', soldCount: 1 },
			{ id: 'd', soldCount: 0 },
		];

		expect(ids(paginateBySoldCount(products))).toEqual(['a', 'c', 'b', 'd']);
	});

	it('does not modify the given list', () => {
		const copy = stored.map((p) => ({ ...p }));

		paginateBySoldCount(stored, { skip: 1, limit: 2 });

		expect(stored).toEqual(copy);
	});

	it('returns an empty page when skip is past the end', () => {
		expect(paginateBySoldCount(stored, { skip: 100, limit: 10 })).toEqual([]);
		expect(paginateBySoldCount([], { skip: 0, limit: 10 })).toEqual([]);
	});

	it('bounds skip and limit that come from the request', () => {
		// negative skip counts as 0
		expect(ids(paginateBySoldCount(stored, { skip: -5, limit: 1 }))).toEqual([
			'p5',
		]);
		// negative or fractional limit is raised to / rounded down to a whole number >= 1
		expect(ids(paginateBySoldCount(stored, { limit: -3 }))).toEqual(['p5']);
		expect(ids(paginateBySoldCount(stored, { limit: 2.9 }))).toEqual([
			'p5',
			'p3',
		]);
		// not-a-number values are not trusted
		expect(ids(paginateBySoldCount(stored, { skip: NaN }))).toEqual(
			ids(paginateBySoldCount(stored))
		);
		expect(paginateBySoldCount(stored, { limit: NaN })).toHaveLength(
			stored.length
		);
		expect(paginateBySoldCount(stored, { skip: Infinity })).toHaveLength(
			stored.length
		);
	});

	it('caps the page size', () => {
		const many = Array.from({ length: MAX_PRODUCTS_PAGE_LIMIT + 50 }, (_, i) => ({
			id: `p${i}`,
			soldCount: i,
		}));

		expect(paginateBySoldCount(many, { limit: 1e9 })).toHaveLength(
			MAX_PRODUCTS_PAGE_LIMIT
		);
	});
});
