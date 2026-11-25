import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { DEFAULT_OPTIONS } from './client';
import { firstValueFrom } from 'rxjs';
import { productInfo } from '../test/fixtures';
import { availableProducts, createGraphQLApi } from './api';
import {
	GEO_LOCATION_PRODUCTS_BY_PAGING,
	GET_CLOSE_MERCHANTS,
	GET_COUNT_OF_GEO_LOCATION_PRODUCTS,
	GET_MERCHANTS_BY_NAME,
	GET_ORDER_STATUS,
} from './documents';

const geoLocation = { loc: { type: 'Point' as const, coordinates: [23.33, 42.64] as [number, number] } };
const options = {
	isDeliveryRequired: true,
	isTakeaway: false,
	merchantIds: [],
	imageOrientation: 1,
	locale: 'en-US',
	withoutCount: true,
};

/** Adds `__typename` to the fixture rows like the server does. */
function typed(row: ReturnType<typeof productInfo>) {
	const wp = row.warehouseProduct;
	return {
		__typename: 'ProductInfo',
		distance: row.distance,
		warehouseId: row.warehouseId,
		warehouseLogo: row.warehouseLogo,
		warehouseProduct: {
			__typename: 'WarehouseProduct',
			id: wp.id,
			price: wp.price,
			initialPrice: wp.initialPrice,
			count: wp.count,
			soldCount: wp.soldCount,
			product: {
				__typename: 'Product',
				id: wp.product.id,
				title: wp.product.title.map((m) => ({ __typename: 'TranslateType', ...m })),
				description: wp.product.description.map((m) => ({ __typename: 'TranslateType', ...m })),
				details: (wp.product.details ?? []).map((m) => ({ __typename: 'TranslateType', ...m })),
				images: wp.product.images.map((m) => ({ __typename: 'ImageType', width: 1, height: 1, ...m })),
			},
			isManufacturing: false,
			isCarrierRequired: true,
			isDeliveryRequired: true,
			isProductAvailable: wp.isProductAvailable,
			isTakeaway: true,
			deliveryTimeMin: wp.deliveryTimeMin,
			deliveryTimeMax: wp.deliveryTimeMax,
		},
	};
}

function client(mocks: ConstructorParameters<typeof MockLink>[0]) {
	return createGraphQLApi(new ApolloClient({ link: new MockLink(mocks), cache: new InMemoryCache(), defaultOptions: DEFAULT_OPTIONS }));
}

describe('GraphQL services (documents of the Ionic app)', () => {
	it('product feed: sends the Ionic variables and keeps only available rows', async () => {
		const api = client([
			{
				request: {
					query: GEO_LOCATION_PRODUCTS_BY_PAGING,
					variables: { geoLocation, options, pagingOptions: { skip: 0, limit: 10 } },
				},
				result: {
					data: {
						geoLocationProductsByPaging: [
							typed(productInfo('1')),
							typed(productInfo('2', { isProductAvailable: false })),
						],
					},
				},
			},
		]);

		const rows = await firstValueFrom(api.watchGeoLocationProducts(geoLocation, { skip: 0, limit: 10 }, options, undefined, 0));
		expect(rows.map((r) => r.warehouseProduct.id)).toEqual(['wp-1']);
	});

	it('product count', async () => {
		const api = client([
			{
				request: { query: GET_COUNT_OF_GEO_LOCATION_PRODUCTS, variables: { geoLocation, options } },
				result: { data: { getCountOfGeoLocationProducts: 42 } },
			},
		]);
		await expect(api.countGeoLocationProducts(geoLocation, options)).resolves.toBe(42);
	});

	it('merchants close to the customer and by name', async () => {
		const merchant = { __typename: 'Warehouse', id: 'w1', username: 'mega', name: 'Mega', logo: 'l.png' };
		const api = client([
			{ request: { query: GET_CLOSE_MERCHANTS, variables: { geoLocation } }, result: { data: { getCloseMerchants: [merchant] } } },
			{
				request: { query: GET_MERCHANTS_BY_NAME, variables: { searchName: 'Me', geoLocation } },
				result: { data: { getMerchantsBuyName: [{ ...merchant, isActive: true }] } },
			},
		]);
		await expect(api.getCloseMerchants(geoLocation)).resolves.toMatchObject([{ id: 'w1', name: 'Mega' }]);
		await expect(api.getMerchantsByName('Me', geoLocation)).resolves.toMatchObject([{ isActive: true }]);
	});

	it('order status of the open order', async () => {
		const api = client([
			{
				request: { query: GET_ORDER_STATUS, variables: { id: 'o1' } },
				result: { data: { getOrder: { __typename: 'Order', status: 1 } } },
			},
		]);
		await expect(api.getOrderStatus('o1')).resolves.toBe(1);
	});

	it('availableProducts drops null rows', () => {
		expect(availableProducts([null, productInfo('1'), productInfo('2', { isProductAvailable: false })])).toHaveLength(1);
		expect(availableProducts(undefined)).toEqual([]);
	});
});
