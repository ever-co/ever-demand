import 'reflect-metadata';
import { Types } from 'mongoose';

// Only the product feed's count and pages are exercised: the nearby-store
// lookup (`getMerchants`) is a stub that returns plain store documents, the
// way its `.lean()` query does.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	ExistenceEventType: { Created: 0, Updated: 1, Removed: 2 },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
}));

import { GeoLocationsProductsService } from '../../../services/geo-locations/GeoLocationsProductsService';

const id = () => new Types.ObjectId().toHexString();

// GeoJSON order: [lng, lat]
const CUSTOMER = {
	countryId: 0,
	city: 'Sofia',
	streetAddress: 'Vitosha',
	house: '1',
	postcode: '1000',
	loc: { type: 'Point', coordinates: [23.32, 42.69] },
} as any;

// What the shops send (shop-web-angular products.component.ts).
const SHOP_OPTIONS = { isDeliveryRequired: true, isTakeaway: false };

interface TestProduct {
	_id: string;
	title: string;
}

function product(title: string): TestProduct {
	return { _id: id(), title };
}

function store(
	lngOffset: number,
	offers: Array<{
		product: TestProduct;
		count?: number;
		isProductAvailable?: boolean;
	}>,
) {
	return {
		_id: id(),
		name: `Store ${lngOffset}`,
		logo: 'logo.png',
		isActive: true,
		isDeleted: false,
		geoLocation: {
			...CUSTOMER,
			loc: {
				type: 'Point',
				coordinates: [23.32 + lngOffset, 42.69],
			},
		},
		products: offers.map((offer) => {
			// a key set to `undefined` leaves the field out of the document
			const isProductAvailable =
				'isProductAvailable' in offer ? offer.isProductAvailable : true;

			return {
				_id: id(),
				price: 1000,
				initialPrice: 1200,
				count: offer.count ?? 5,
				soldCount: 0,
				isManufacturing: true,
				isCarrierRequired: true,
				isDeliveryRequired: true,
				isTakeaway: false,
				...(isProductAvailable === undefined
					? {}
					: { isProductAvailable }),
				product: {
					_id: offer.product._id,
					title: [{ locale: 'en-US', value: offer.product.title }],
					description: [],
					details: [],
					categories: [],
					images: [
						{
							locale: 'en-US',
							url: 'https://example.com/p.png',
							width: 100,
							height: 100,
							orientation: 0,
						},
					],
				},
			};
		}),
	};
}

describe('GeoLocationsProductsService: the feed count matches the rows it pages through', () => {
	let merchants: any[];
	let getMerchants: jest.Mock;
	let service: GeoLocationsProductsService;

	beforeEach(() => {
		merchants = [];
		// a fresh copy per call: the filters rewrite product images in place
		getMerchants = jest.fn(async () => structuredClone(merchants));

		service = new GeoLocationsProductsService(
			{} as any,
			{ getMerchants } as any,
		);
	});

	const count = (options?: any, searchText?: string) =>
		service.getCountOfGeoLocationProducts(CUSTOMER, options, searchText);

	const rows = (options?: any, searchText?: string, skip = 0, limit = 100) =>
		service.geoLocationProductsByPaging(
			CUSTOMER,
			{ skip, limit },
			options,
			searchText,
		);

	const ids = (infos: any[]) =>
		infos.map((info) => [
			info.warehouseId,
			info.warehouseProduct.productId,
		]);

	it('counts one row per store offer when two stores sell the same product', async () => {
		const a = product('Pizza');
		const b = product('Salad');
		const near = store(0.001, [{ product: a }, { product: b }]);
		const far = store(0.01, [{ product: a }]);
		merchants = [far, near];

		const page = await rows();

		// rows stay grouped by product, nearest store first
		expect(ids(page)).toEqual([
			[near._id, a._id],
			[far._id, a._id],
			[near._id, b._id],
		]);
		expect(page[0].distance).toBeLessThan(page[1].distance);

		expect(await count()).toBe(page.length);
		expect(await count()).toBe(3);
	});

	it('counts the same rows with the options the shops send', async () => {
		const a = product('Pizza');
		const b = product('Salad');
		merchants = [
			store(0.001, [{ product: a }, { product: b }]),
			store(0.01, [{ product: a }]),
		];

		const page = await rows(SHOP_OPTIONS);

		expect(page).toHaveLength(3);
		expect(await count(SHOP_OPTIONS)).toBe(3);
	});

	it('lets a shop that pages until it has `count` rows reach every product', async () => {
		// two stores share 10 products: 10 products, 20 rows
		const products = Array.from({ length: 10 }, (_, i) =>
			product(`Product ${i}`),
		);
		merchants = [
			store(
				0.001,
				products.map((p) => ({ product: p })),
			),
			store(
				0.01,
				products.map((p) => ({ product: p })),
			),
		];

		// the loop of shop-web-angular products.component.ts loadProducts()
		const loaded: any[] = [];
		for (let i = 0; i < 10; i++) {
			const productsCount = await count(SHOP_OPTIONS);

			if (!(productsCount > loaded.length)) {
				break;
			}

			loaded.push(
				...(await rows(SHOP_OPTIONS, undefined, loaded.length, 10)),
			);
		}

		expect(loaded).toHaveLength(20);
		expect(
			new Set(loaded.map((info) => info.warehouseProduct.productId)).size,
		).toBe(10);
	});

	it('leaves an unavailable product out of both the count and the rows', async () => {
		const a = product('Pizza');
		const hidden = product('Hidden');
		const unset = product('Unset');
		merchants = [
			store(0.001, [
				{ product: a },
				{ product: hidden, isProductAvailable: false },
				{ product: unset, isProductAvailable: undefined },
			]),
			store(0.01, [{ product: a }]),
		];

		for (const options of [undefined, SHOP_OPTIONS]) {
			const page = await rows(options);
			const productIds = page.map(
				(info) => info.warehouseProduct.productId,
			);

			expect(productIds).toEqual([a._id, a._id]);
			expect(await count(options)).toBe(page.length);
		}
	});

	it('leaves a sold-out row out unless withoutCount is set', async () => {
		const a = product('Pizza');
		const soldOut = product('Sold out');
		merchants = [
			store(0.001, [{ product: a }, { product: soldOut, count: 0 }]),
			store(0.01, [{ product: a }]),
		];

		const inStock = await rows({});
		expect(inStock.map((info) => info.warehouseProduct.productId)).toEqual([
			a._id,
			a._id,
		]);
		expect(await count({})).toBe(inStock.length);

		const all = await rows({ withoutCount: true });
		expect(all.map((info) => info.warehouseProduct.productId)).toEqual([
			a._id,
			a._id,
			soldOut._id,
		]);
		expect(await count({ withoutCount: true })).toBe(all.length);
	});

	it('applies the search text to the count the way it does to the rows', async () => {
		const pizza = product('Pizza Margherita');
		const salad = product('Green salad');
		merchants = [
			store(0.001, [{ product: pizza }, { product: salad }]),
			store(0.01, [{ product: pizza }]),
		];

		const page = await rows(SHOP_OPTIONS, 'pizza');

		expect(page.map((info) => info.warehouseProduct.productId)).toEqual([
			pizza._id,
			pizza._id,
		]);
		expect(await count(SHOP_OPTIONS, 'pizza')).toBe(page.length);
		expect(await count(SHOP_OPTIONS, 'nothing like it')).toBe(0);
	});

	it('still returns 0 when the store lookup fails', async () => {
		getMerchants.mockRejectedValueOnce(new Error('db down'));

		expect(await count(SHOP_OPTIONS)).toBe(0);
	});
});
