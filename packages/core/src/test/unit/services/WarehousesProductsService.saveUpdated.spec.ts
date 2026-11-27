import 'reflect-metadata';
import { of } from 'rxjs';
import { Types } from 'mongoose';

// Only how a warehouse product is written back is exercised: the warehouse
// service (and its mongoose model) is a stub that records the update.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses/WarehousesService', () => ({
	WarehousesService: class {},
}));

import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehousesProductsService } from '../../../services/warehouses/WarehousesProductsService';

const STORE_ID = new Types.ObjectId().toHexString();
const PRODUCT_ID = new Types.ObjectId().toHexString();
const WAREHOUSE_PRODUCT_ID = new Types.ObjectId().toHexString();

/**
 * A warehouse product as `WarehousesService.get(id)` returns it: with the
 * product populated (a Product instance), not the ref stored in MongoDB.
 */
function populatedWarehouseProduct(count: number) {
	return new WarehouseProduct({
		_id: WAREHOUSE_PRODUCT_ID,
		price: 1500,
		initialPrice: 1800,
		count,
		soldCount: 0,
		isManufacturing: true,
		isCarrierRequired: true,
		isDeliveryRequired: true,
		isProductAvailable: true,
		product: {
			_id: PRODUCT_ID,
			title: [{ locale: 'en-US', value: 'Pizza' }],
			description: [],
			details: [],
			images: [],
			categories: [],
		},
	} as any);
}

describe('WarehousesProductsService writes products as refs (regression: order create failed with "Cast to embedded failed")', () => {
	let updateMultiple: jest.Mock;
	let service: WarehousesProductsService;

	beforeEach(() => {
		// applies the `products.$.<field>` $set (or an $inc) to the stored element
		updateMultiple = jest.fn(async (_find, update) => {
			const stored: any = {
				_id: WAREHOUSE_PRODUCT_ID,
				product: PRODUCT_ID,
				count: 10,
				soldCount: 0,
			};
			for (const [path, value] of Object.entries(update)) {
				if (path === '$inc') {
					for (const [incPath, by] of Object.entries(value as object)) {
						stored[incPath.replace(/^products\.\$\./, '')] += by;
					}
				} else {
					stored[path.replace(/^products\.\$\./, '')] = value;
				}
			}
			return [{ products: [new WarehouseProduct(stored)] }];
		});

		const warehousesService = {
			throwIfNotExists: jest.fn().mockResolvedValue(undefined),
			get: jest.fn(() =>
				of({ id: STORE_ID, products: [populatedWarehouseProduct(10)] })
			),
			updateMultiple,
		};

		service = new WarehousesProductsService(warehousesService as any);
	});

	it('decreaseCount() (order create) writes only the count change, never the populated product', async () => {
		const updated = await service.decreaseCount(STORE_ID, PRODUCT_ID, 2);

		expect(updateMultiple).toHaveBeenCalledTimes(1);

		const [findObj, updateObj] = updateMultiple.mock.calls[0];
		expect(String(findObj._id)).toBe(STORE_ID);
		expect(String(findObj.products.$elemMatch.product)).toBe(PRODUCT_ID);
		expect(findObj.products.$elemMatch.count).toEqual({ $gte: 2 });

		// one $inc of the matched element (`products.$`): no product ref, no
		// `products.$._updatedAt` and no other field of an old snapshot
		expect(updateObj).toEqual({ $inc: { 'products.$.count': -2 } });

		expect(updated.productId).toBe(PRODUCT_ID);
		expect(updated.count).toBe(8);
	});

	it('saveUpdated() writes the product id, not the populated product', async () => {
		await service.saveUpdated(STORE_ID, populatedWarehouseProduct(4));

		const [findObj, updateObj] = updateMultiple.mock.calls[0];
		expect(String(findObj._id)).toBe(STORE_ID);
		expect(String(findObj['products._id'])).toBe(WAREHOUSE_PRODUCT_ID);

		// regression: replacing the whole element (`'products.$': obj`) made
		// Mongoose also set `products.$._updatedAt`, a conflict for MongoDB
		expect(updateObj['products.$']).toBeUndefined();
		expect(Object.keys(updateObj).every((path) => path.startsWith('products.$.'))).toBe(true);
		expect(updateObj).not.toHaveProperty(['products.$._id']);
		expect(updateObj).not.toHaveProperty(['products.$._updatedAt']);

		expect(updateObj['products.$.product']).toBe(PRODUCT_ID);
		expect(updateObj['products.$.count']).toBe(4);
		expect(updateObj['products.$.price']).toBe(1500);
		expect(updateObj['products.$.soldCount']).toBe(0);
	});

	it('saveUpdated() leaves the caller object populated', async () => {
		const warehouseProduct = populatedWarehouseProduct(4);

		await service.saveUpdated(STORE_ID, warehouseProduct);

		expect(typeof warehouseProduct.product).toBe('object');
		expect(updateMultiple.mock.calls[0][1]['products.$.product']).toBe(PRODUCT_ID);
	});

	it('writes a product that is already a ref unchanged', async () => {
		const warehouseProduct = populatedWarehouseProduct(4);
		(warehouseProduct as any).product = PRODUCT_ID;

		await service.saveUpdated(STORE_ID, warehouseProduct);

		expect(updateMultiple.mock.calls[0][1]['products.$.product']).toBe(PRODUCT_ID);
	});
});
