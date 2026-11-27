import 'reflect-metadata';
import { defer } from 'rxjs';
import { Types } from 'mongoose';

// The store's products live in a fake store document. The fake warehouse
// service answers each call after a round trip, the way MongoDB does, so
// calls that run at the same time interleave. Its `updateMultiple` checks the
// filter and applies the update in one step, as MongoDB does for a document.
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
const OTHER_PRODUCT_ID = new Types.ObjectId().toHexString();

/** Lets the other pending calls run, like a round trip to MongoDB. */
const roundTrip = () => new Promise<void>((resolve) => setImmediate(resolve));

/** `value` matches a filter `condition`: a value, or `{ $gte }` / `{ $eq }`. */
function matches(value: unknown, condition: unknown): boolean {
	if (
		condition != null &&
		typeof condition === 'object' &&
		!(condition instanceof Types.ObjectId)
	) {
		return Object.entries(condition).every(([operator, operand]) => {
			switch (operator) {
				case '$gte':
					return (value as number) >= (operand as number);
				case '$eq':
					return String(value) === String(operand);
				default:
					throw new Error(`fake: unsupported operator ${operator}`);
			}
		});
	}

	return String(value) === String(condition);
}

function createFakeStore(initial: {
	count: number;
	soldCount?: number;
	price?: number;
}) {
	const store = {
		exists: true,
		isDeleted: false,
		products: [
			{
				_id: new Types.ObjectId().toHexString(),
				product: PRODUCT_ID,
				price: initial.price ?? 1500,
				initialPrice: 1800,
				count: initial.count,
				soldCount: initial.soldCount ?? 0,
				isManufacturing: true,
				isCarrierRequired: true,
				isDeliveryRequired: true,
				isProductAvailable: true,
			},
		] as Record<string, any>[],
	};

	const snapshot = () => ({
		_id: STORE_ID,
		id: STORE_ID,
		isDeleted: store.isDeleted,
		products: store.products.map(
			(stored) => new WarehouseProduct({ ...stored } as any),
		),
	});

	/** Index of the product element the filter matches (`products.$`), or -1. */
	const matchedProduct = (filter: Record<string, any>): number => {
		let index = 0;

		for (const [path, condition] of Object.entries(filter)) {
			if (path === '_id') {
				if (!matches(STORE_ID, condition)) return -1;
			} else if (path === 'isDeleted') {
				if (!matches(store.isDeleted, condition)) return -1;
			} else if (path === 'products') {
				index = store.products.findIndex((stored) =>
					Object.entries(condition.$elemMatch).every(
						([field, fieldCondition]) =>
							matches(stored[field], fieldCondition),
					),
				);
				if (index === -1) return -1;
			} else if (path.startsWith('products.')) {
				const field = path.slice('products.'.length);
				index = store.products.findIndex((stored) =>
					matches(stored[field], condition),
				);
				if (index === -1) return -1;
			} else {
				throw new Error(`fake: unsupported filter path ${path}`);
			}
		}

		return index;
	};

	const apply = (
		stored: Record<string, any>,
		update: Record<string, any>,
	) => {
		const field = (path: string) => {
			if (!path.startsWith('products.$.')) {
				throw new Error(`fake: unsupported update path ${path}`);
			}
			return path.slice('products.$.'.length);
		};

		for (const [key, value] of Object.entries(update)) {
			if (key === '$inc') {
				for (const [path, by] of Object.entries(value)) {
					stored[field(path)] += by as number;
				}
			} else if (key === '$set') {
				for (const [path, to] of Object.entries(value)) {
					stored[field(path)] = to;
				}
			} else if (key.startsWith('$')) {
				throw new Error(`fake: unsupported update operator ${key}`);
			} else {
				// a plain path is a $set (Mongoose)
				stored[field(key)] = value;
			}
		}
	};

	const warehousesService = {
		get: jest.fn((_id: string) =>
			defer(async () => {
				const read = store.exists ? snapshot() : null;
				await roundTrip();
				return read;
			}),
		),
		getCurrent: jest.fn(async (_id: string) => {
			const read = store.exists ? snapshot() : null;
			await roundTrip();
			return read;
		}),
		throwIfNotExists: jest.fn(async (id: string) => {
			await roundTrip();
			if (!store.exists || store.isDeleted) {
				throw new Error(`Store with id '${id}' does not exists!`);
			}
		}),
		updateMultiple: jest.fn(
			async (
				filter: Record<string, any>,
				update: Record<string, any>,
			) => {
				await roundTrip();

				if (!store.exists) {
					return [];
				}

				// filter check and write in one step, like MongoDB
				const index = matchedProduct(filter);
				if (index === -1) {
					return [];
				}
				apply(store.products[index], update);

				const written = snapshot();
				await roundTrip();
				return [written];
			},
		),
	};

	return {
		store,
		warehousesService,
		stock: () => store.products[0],
	};
}

describe('WarehousesProductsService counts when orders change one store product at the same time', () => {
	it('two decreaseCount() calls at the same time both take their quantity from the stock', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await Promise.all([
			service.decreaseCount(STORE_ID, PRODUCT_ID, 2),
			service.decreaseCount(STORE_ID, PRODUCT_ID, 3),
		]);

		expect(stock().count).toBe(5);
	});

	it('the order lines of one order update stock and sold count of a product they share (order create)', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		// what WarehousesOrdersService._updateProductCount() does
		await Promise.all(
			[2, 3].map(async (count) => {
				await service.decreaseCount(STORE_ID, PRODUCT_ID, count);
				await service.increaseSoldCount(STORE_ID, PRODUCT_ID, count);
			}),
		);

		expect(stock().count).toBe(5);
		expect(stock().soldCount).toBe(5);
	});

	it('two orders for the last items at the same time: one gets them, the other is refused', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 4 });
		const service = new WarehousesProductsService(warehousesService as any);

		const results = await Promise.allSettled([
			service.decreaseCount(STORE_ID, PRODUCT_ID, 3),
			service.decreaseCount(STORE_ID, PRODUCT_ID, 3),
		]);

		expect(results.map((result) => result.status).sort()).toEqual([
			'fulfilled',
			'rejected',
		]);
		const refused = results.find(
			(result) => result.status === 'rejected',
		) as PromiseRejectedResult;
		expect(refused.reason.message).toBe(
			'Request to remove more products than available',
		);
		expect(stock().count).toBe(1);
	});

	it('a decrease larger than the stock throws and leaves the stock as it was', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await expect(
			service.decreaseCount(STORE_ID, PRODUCT_ID, 11),
		).rejects.toThrow('Request to remove more products than available');

		expect(stock().count).toBe(10);
		expect(stock().soldCount).toBe(0);
	});

	it('concurrent increaseSoldCount() calls add up', async () => {
		const { warehousesService, stock } = createFakeStore({
			count: 10,
			soldCount: 1,
		});
		const service = new WarehousesProductsService(warehousesService as any);

		await Promise.all([
			service.increaseSoldCount(STORE_ID, PRODUCT_ID, 2),
			service.increaseSoldCount(STORE_ID, PRODUCT_ID, 3),
		]);

		expect(stock().soldCount).toBe(6);
		expect(stock().count).toBe(10);
	});

	it('concurrent increaseCount() calls add up (cancelled orders give their stock back)', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await Promise.all([
			service.increaseCount(STORE_ID, PRODUCT_ID, 2),
			service.increaseCount(STORE_ID, PRODUCT_ID, 3),
		]);

		expect(stock().count).toBe(15);
	});

	it('concurrent decreaseSoldCount() calls add up, and a decrease below zero is refused', async () => {
		const { warehousesService, stock } = createFakeStore({
			count: 0,
			soldCount: 5,
		});
		const service = new WarehousesProductsService(warehousesService as any);

		await Promise.all([
			service.decreaseSoldCount(STORE_ID, PRODUCT_ID, 2),
			service.decreaseSoldCount(STORE_ID, PRODUCT_ID, 3),
		]);
		expect(stock().soldCount).toBe(0);

		await expect(
			service.decreaseSoldCount(STORE_ID, PRODUCT_ID, 1),
		).rejects.toThrow(
			'Request to decrease count of more products than available',
		);
		expect(stock().soldCount).toBe(0);
	});

	it('changePrice() sets only the price, so it does not write an old stock back', async () => {
		const { warehousesService, stock } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await Promise.all([
			service.decreaseCount(STORE_ID, PRODUCT_ID, 2),
			service.changePrice(STORE_ID, PRODUCT_ID, 999),
		]);

		expect(stock().count).toBe(8);
		expect(stock().price).toBe(999);

		const priceUpdate = warehousesService.updateMultiple.mock.calls
			.map(([, update]) => update)
			.find((update) => update.$set);
		expect(priceUpdate).toEqual({ $set: { 'products.$.price': 999 } });
	});

	it('decreaseCount() is one write that MongoDB checks against the stock', async () => {
		const { warehousesService } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await service.decreaseCount(STORE_ID, PRODUCT_ID, 2);

		expect(warehousesService.updateMultiple).toHaveBeenCalledTimes(1);
		const [filter, update] = warehousesService.updateMultiple.mock.calls[0];
		expect(String(filter._id)).toBe(STORE_ID);
		expect(String(filter.products.$elemMatch.product)).toBe(PRODUCT_ID);
		expect(filter.products.$elemMatch.count).toEqual({ $gte: 2 });
		expect(update).toEqual({ $inc: { 'products.$.count': -2 } });
	});

	it('returns the updated warehouse product', async () => {
		const { warehousesService } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		const decreased = await service.decreaseCount(STORE_ID, PRODUCT_ID, 2);
		expect(decreased).toBeInstanceOf(WarehouseProduct);
		expect(decreased.productId).toBe(PRODUCT_ID);
		expect(decreased.count).toBe(8);

		const sold = await service.increaseSoldCount(STORE_ID, PRODUCT_ID, 2);
		expect(sold.productId).toBe(PRODUCT_ID);
		expect(sold.count).toBe(8);
		expect(sold.soldCount).toBe(2);
	});

	describe('when nothing matched, the errors of each method', () => {
		it('a product the store does not have', async () => {
			const { warehousesService } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await expect(
				service.decreaseCount(STORE_ID, OTHER_PRODUCT_ID, 1),
			).rejects.toThrow(
				`There is no such an product with the id ${OTHER_PRODUCT_ID} in the warehouse with the id ${STORE_ID}`,
			);
			await expect(
				service.decreaseSoldCount(STORE_ID, OTHER_PRODUCT_ID, 1),
			).rejects.toThrow(
				`There is no such an product with the id ${OTHER_PRODUCT_ID} in the warehouse with the id ${STORE_ID}`,
			);
			await expect(
				service.increaseCount(STORE_ID, OTHER_PRODUCT_ID, 1),
			).rejects.toThrow('Cannot find product');
			await expect(
				service.increaseSoldCount(STORE_ID, OTHER_PRODUCT_ID, 1),
			).rejects.toThrow('Cannot find product');
		});

		it.each([
			['a missing store', (store: any) => (store.exists = false)],
			['a deleted store', (store: any) => (store.isDeleted = true)],
		])('%s, and its stock stays as it was', async (_name, remove) => {
			const { store, warehousesService, stock } = createFakeStore({
				count: 10,
				soldCount: 5,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);
			remove(store);

			await expect(
				service.decreaseCount(STORE_ID, PRODUCT_ID, 1),
			).rejects.toThrow(`Cannot find warehouse: ${STORE_ID}`);
			await expect(
				service.decreaseSoldCount(STORE_ID, PRODUCT_ID, 1),
			).rejects.toThrow(`Cannot find warehouse: ${STORE_ID}`);
			await expect(
				service.increaseCount(STORE_ID, PRODUCT_ID, 1),
			).rejects.toThrow('Cannot find warehouse');
			await expect(
				service.increaseSoldCount(STORE_ID, PRODUCT_ID, 1),
			).rejects.toThrow('Cannot find warehouse');

			expect(stock().count).toBe(10);
			expect(stock().soldCount).toBe(5);
		});
	});
});
