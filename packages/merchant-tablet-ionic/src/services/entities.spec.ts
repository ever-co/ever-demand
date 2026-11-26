import Product from '@modules/server.common/entities/Product';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import Warehouse from '@modules/server.common/entities/Warehouse';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';

/**
 * GraphQL results carry `id`, `createdAt` and other fields that the shared entities expose as
 * getters only. The esbuild bundles are ES modules (strict mode), where assigning to such a getter
 * throws, so `DBObject` skips them (packages/common `assignRaw`).
 */
describe('shared entities built from GraphQL data', () => {
	const product = {
		_id: '6b076a357b56ef1169ad1b31',
		id: '6b076a357b56ef1169ad1b31',
		_createdAt: '2026-11-25T10:00:00.000Z',
		createdAt: '2026-11-25T10:00:00.000Z',
		title: [{ locale: 'en-US', value: 'Pizza' }],
		description: [],
		details: [],
		images: [],
		categories: [],
		__typename: 'Product',
	};

	it('a warehouse product with a nested product', () => {
		const wp = new WarehouseProduct({
			_id: '6b076a357b56ef1169ad1b32',
			id: '6b076a357b56ef1169ad1b32',
			price: 12,
			initialPrice: 15,
			count: 3,
			product,
		} as any);

		expect(wp.id).toBe('6b076a357b56ef1169ad1b32');
		expect(wp.price).toBe(12);
		expect((wp.product as Product).id).toBe('6b076a357b56ef1169ad1b31');
		expect((wp.product as Product).title[0].value).toBe('Pizza');
		expect((wp.product as Product).createdAt).toEqual(new Date('2026-11-25T10:00:00.000Z'));
	});

	it('a store (warehouse) with read-only fields in the payload', () => {
		const store = new Warehouse({
			_id: '6b076a357b56ef1169ad1b33',
			id: '6b076a357b56ef1169ad1b33',
			name: 'Debug Store',
			products: [],
		} as any);

		expect(store.id).toBe('6b076a357b56ef1169ad1b33');
		expect(store.name).toBe('Debug Store');
	});

	it('a product info whose payload repeats the derived product', () => {
		const info = new ProductInfo({
			warehouseId: 'w1',
			warehouseLogo: 'logo.png',
			distance: 1,
			product,
			warehouseProduct: { _id: 'x', price: 1, initialPrice: 1, count: 1, product },
		} as any);

		expect(info.warehouseId).toBe('w1');
		expect(info.product.title[0].value).toBe('Pizza');
	});
});
