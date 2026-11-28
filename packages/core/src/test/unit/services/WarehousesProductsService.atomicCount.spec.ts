import 'reflect-metadata';
import { defer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Types } from 'mongoose';

// The store's products live in a fake store document. The fake warehouse
// service answers each call after a round trip, the way MongoDB does, so
// calls that run at the same time interleave. Its writes (`updateOne`,
// `updateMultiple` and the model's `findByIdAndUpdate`) check the filter and
// apply the update in one step, as MongoDB does for a document.
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

/**
 * `value` matches a filter `condition`: a value, or `{ $gte }` / `{ $eq }` /
 * `{ $ne }`. Like MongoDB, `null` matches null or a missing field.
 */
function matches(value: unknown, condition: unknown): boolean {
	if (condition === null) {
		return value == null;
	}

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
				case '$ne':
					return !matches(value, operand);
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
	isTakeaway?: boolean;
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
				isTakeaway: initial.isTakeaway ?? false,
			},
		] as Record<string, any>[],
	};

	/** A product as Mongoose casts it into the store (an id, defaults). */
	const asStored = (product: Record<string, any>) => ({
		_id: new Types.ObjectId().toHexString(),
		count: 0,
		soldCount: 0,
		...product,
	});

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
				if (condition?.$ne !== undefined) {
					// on an array: no product of the store has the value
					if (
						store.products.some((stored) =>
							matches(stored[field], condition.$ne),
						)
					) {
						return -1;
					}
					continue;
				}
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

	/** Applies `update` to the store, `products.$` being product `index`. */
	const apply = (index: number, update: Record<string, any>) => {
		const field = (path: string) => {
			if (!path.startsWith('products.$.')) {
				throw new Error(`fake: unsupported update path ${path}`);
			}
			return path.slice('products.$.'.length);
		};
		const stored = store.products[index];

		for (const [key, value] of Object.entries(update)) {
			if (key === '$push') {
				for (const [path, product] of Object.entries(value)) {
					if (path !== 'products') {
						throw new Error(`fake: unsupported $push path ${path}`);
					}
					store.products.push(asStored(product as any));
				}
			} else if (key === '$inc') {
				for (const [path, by] of Object.entries(value)) {
					const counter = field(path);
					// like MongoDB: a missing field starts at 0, null is refused
					if (stored[counter] === null) {
						throw new Error(
							`fake: Cannot apply $inc to a value of non-numeric type null`,
						);
					}
					stored[counter] = (stored[counter] ?? 0) + (by as number);
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

	/** One write: the filter check and the update in one step, like MongoDB. */
	const write = async (
		filter: Record<string, any>,
		update: Record<string, any>,
	) => {
		await roundTrip();

		if (!store.exists) {
			return null;
		}

		const index = matchedProduct(filter);
		if (index === -1) {
			return null;
		}
		apply(index, update);

		const written = snapshot();
		await roundTrip();
		return written;
	};

	const warehousesService = {
		// like WarehousesService.get(): refuses a missing or deleted store
		get: jest.fn((id: string) =>
			defer(async () => {
				const read = store.exists ? snapshot() : null;
				await roundTrip();
				if (read == null || read.isDeleted) {
					throw new Error(`Store with id '${id}' does not exists!`);
				}
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
		updateOne: jest.fn(write),
		updateMultiple: jest.fn(
			async (
				filter: Record<string, any>,
				update: Record<string, any>,
			) => {
				const written = await write(filter, update);
				return written == null ? [] : [written];
			},
		),
		// the model, for a write of the whole products array of the store
		Model: {
			findByIdAndUpdate: jest.fn(
				(_id: string, update: Record<string, any>) => {
					const query = {
						populate: () => query,
						lean: () => query,
						exec: async () => {
							await roundTrip();
							store.products = update.$set.products.map(
								(product: Record<string, any>) =>
									asStored({ ...product }),
							);
							const written = snapshot();
							await roundTrip();
							return written;
						},
					};
					return query;
				},
			),
		},
		existence: { next: jest.fn() },
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

		const priceUpdate = warehousesService.updateOne.mock.calls
			.map(([, update]) => update)
			.find((update) => update.$set);
		expect(priceUpdate).toEqual({ $set: { 'products.$.price': 999 } });
	});

	it('decreaseCount() is one write that MongoDB checks against the stock', async () => {
		const { warehousesService } = createFakeStore({ count: 10 });
		const service = new WarehousesProductsService(warehousesService as any);

		await service.decreaseCount(STORE_ID, PRODUCT_ID, 2);

		expect(warehousesService.updateOne).toHaveBeenCalledTimes(1);
		const [filter, update] = warehousesService.updateOne.mock.calls[0];
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

describe('WarehousesProductsService keeps the counts of orders while the store adds or edits products', () => {
	const noGetProductTypeMessage = `There should be true at least one of the two - "isCarrierRequired" or "isTakeaway"!`;

	/** One order line: what WarehousesOrdersService._updateProductCount() does. */
	const orderLine = async (
		service: WarehousesProductsService,
		count: number,
	) => {
		await service.decreaseCount(STORE_ID, PRODUCT_ID, count);
		await service.increaseSoldCount(STORE_ID, PRODUCT_ID, count);
	};

	const createObject = (product: string, count: number) => ({
		product,
		count,
		price: 900,
		initialPrice: 1000,
	});

	describe('add()', () => {
		it('stock given back (an order cancel) at the same time as an order: both stay', async () => {
			const { warehousesService, stock } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await Promise.all([
				orderLine(service, 3),
				service.add(STORE_ID, [createObject(PRODUCT_ID, 5)]),
			]);

			expect(stock().count).toBe(12);
			expect(stock().soldCount).toBe(3);
		});

		it('a new product added at the same time as an order of another product: the order stays', async () => {
			const { store, warehousesService, stock } = createFakeStore({
				count: 10,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await Promise.all([
				orderLine(service, 3),
				service.add(STORE_ID, [createObject(OTHER_PRODUCT_ID, 4)]),
			]);

			expect(stock().count).toBe(7);
			expect(stock().soldCount).toBe(3);

			const added = store.products.filter(
				(stored) => String(stored.product) === OTHER_PRODUCT_ID,
			);
			expect(added).toHaveLength(1);
			// neither delivery nor takeaway given: delivery
			expect(added[0]).toMatchObject({
				count: 4,
				price: 900,
				isDeliveryRequired: true,
			});
		});

		it('the same new product added twice at the same time: one store product with both counts', async () => {
			const { store, warehousesService } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await Promise.all([
				service.add(STORE_ID, [createObject(OTHER_PRODUCT_ID, 2)]),
				service.add(STORE_ID, [createObject(OTHER_PRODUCT_ID, 3)]),
			]);

			const added = store.products.filter(
				(stored) => String(stored.product) === OTHER_PRODUCT_ID,
			);
			expect(added).toHaveLength(1);
			expect(added[0].count).toBe(5);
		});

		it('a stock stored as null (an add with count null): two adds at the same time set it and add up', async () => {
			const { warehousesService, stock } = createFakeStore({ count: 10 });
			stock().count = null;
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await Promise.all([
				service.add(STORE_ID, [createObject(PRODUCT_ID, 2)]),
				service.add(STORE_ID, [createObject(PRODUCT_ID, 3)]),
			]);

			expect(stock().count).toBe(5);
		});

		it('a new product without a count is stored with stock 0, so a later add works', async () => {
			const { store, warehousesService } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await service.add(STORE_ID, [
				{ ...createObject(OTHER_PRODUCT_ID, 0), count: null as any },
			]);
			await service.add(STORE_ID, [createObject(OTHER_PRODUCT_ID, 2)]);

			const added = store.products.filter(
				(stored) => String(stored.product) === OTHER_PRODUCT_ID,
			);
			expect(added).toHaveLength(1);
			expect(added[0].count).toBe(2);
		});

		it('a bad product id refuses the whole add before any write', async () => {
			const { warehousesService, stock } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await expect(
				service.add(STORE_ID, [
					createObject(PRODUCT_ID, 1),
					createObject('not-an-object-id', 1),
				]),
			).rejects.toThrow(
				'There is no product with the id not-an-object-id!',
			);

			expect(warehousesService.updateOne).not.toHaveBeenCalled();
			expect(stock().count).toBe(10);
		});

		it('is one $inc for a product the store holds and one $push for a new one, and returns the products of the store', async () => {
			const { warehousesService } = createFakeStore({ count: 10 });
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			const products = await service.add(STORE_ID, [
				createObject(PRODUCT_ID, 5),
				{ ...createObject(OTHER_PRODUCT_ID, 4), isTakeaway: true },
			]);

			// never a write of the whole products array of the store
			expect(
				warehousesService.Model.findByIdAndUpdate,
			).not.toHaveBeenCalled();
			expect(warehousesService.updateOne).toHaveBeenCalledTimes(2);
			const [[heldFilter, heldUpdate], [newFilter, newUpdate]] =
				warehousesService.updateOne.mock.calls;
			expect(String(heldFilter.products.$elemMatch.product)).toBe(
				PRODUCT_ID,
			);
			expect(heldUpdate).toEqual({ $inc: { 'products.$.count': 5 } });
			expect(String(newFilter['products.product'].$ne)).toBe(
				OTHER_PRODUCT_ID,
			);
			expect(newUpdate).toEqual({
				$push: {
					products: {
						...createObject(OTHER_PRODUCT_ID, 4),
						isTakeaway: true,
					},
				},
			});

			expect(products.every((p) => p instanceof WarehouseProduct)).toBe(
				true,
			);
			expect(products.map((p) => [p.productId, p.count]).sort()).toEqual(
				[
					[PRODUCT_ID, 15],
					[OTHER_PRODUCT_ID, 4],
				].sort(),
			);
		});
	});

	describe.each([
		['changeProductAvailability', 'isProductAvailable'],
		['changeProductTakeaway', 'isTakeaway'],
		['changeProductDelivery', 'isDeliveryRequired'],
	] as const)('%s()', (method, field) => {
		it('turned off at the same time as an order: the order stays', async () => {
			const { warehousesService, stock } = createFakeStore({
				count: 10,
				soldCount: 1,
				isTakeaway: true,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			const [, updated] = await Promise.all([
				orderLine(service, 3),
				service[method](STORE_ID, PRODUCT_ID, false),
			]);

			expect(stock()[field]).toBe(false);
			expect(stock().count).toBe(7);
			expect(stock().soldCount).toBe(4);

			expect(updated).toBeInstanceOf(WarehouseProduct);
			expect(updated.productId).toBe(PRODUCT_ID);
			expect(updated[field]).toBe(false);
		});

		it('sets only its own field, in one write', async () => {
			const { warehousesService } = createFakeStore({
				count: 10,
				isTakeaway: true,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await service[method](STORE_ID, PRODUCT_ID, true);

			expect(warehousesService.updateOne).toHaveBeenCalledTimes(1);
			expect(warehousesService.updateMultiple).not.toHaveBeenCalled();
			const [filter, update] = warehousesService.updateOne.mock.calls[0];
			expect(String(filter._id)).toBe(STORE_ID);
			expect(String(filter.products.$elemMatch.product)).toBe(PRODUCT_ID);
			expect(update).toEqual({
				$set: { [`products.$.${field}`]: true },
			});
		});

		it('keeps its errors, and writes nothing', async () => {
			const { store, warehousesService, stock } = createFakeStore({
				count: 10,
				isTakeaway: true,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			await expect(
				service[method](STORE_ID, OTHER_PRODUCT_ID, false),
			).rejects.toThrow('Cannot find product');

			store.isDeleted = true;
			await expect(
				service[method](STORE_ID, PRODUCT_ID, false),
			).rejects.toThrow(`Store with id '${STORE_ID}' does not exists!`);

			expect(stock()[field]).toBe(true);
		});
	});

	describe('takeaway or delivery stays on', () => {
		it.each([
			['changeProductTakeaway', 'isTakeaway', 'isDeliveryRequired'],
			['changeProductDelivery', 'isDeliveryRequired', 'isTakeaway'],
		] as const)(
			'%s(false) is refused while the other one is off',
			async (method, field, other) => {
				const { warehousesService, stock } = createFakeStore({
					count: 10,
					isTakeaway: true,
				});
				stock()[other] = false;
				const service = new WarehousesProductsService(
					warehousesService as any,
				);

				await expect(
					service[method](STORE_ID, PRODUCT_ID, false),
				).rejects.toThrow(noGetProductTypeMessage);

				expect(stock()[field]).toBe(true);
			},
		);

		it('takeaway and delivery turned off at the same time: one of them is refused', async () => {
			const { warehousesService, stock } = createFakeStore({
				count: 10,
				isTakeaway: true,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			const results = await Promise.allSettled([
				service.changeProductTakeaway(STORE_ID, PRODUCT_ID, false),
				service.changeProductDelivery(STORE_ID, PRODUCT_ID, false),
			]);

			expect(results.map((result) => result.status).sort()).toEqual([
				'fulfilled',
				'rejected',
			]);
			const refused = results.find(
				(result) => result.status === 'rejected',
			) as PromiseRejectedResult;
			expect(refused.reason.message).toBe(noGetProductTypeMessage);
			expect(stock().isTakeaway || stock().isDeliveryRequired).toBe(true);
		});
	});

	describe('saveUpdated()', () => {
		it('a product the merchant edits while an order is placed: the sold count of the order stays', async () => {
			const { warehousesService, stock } = createFakeStore({
				count: 10,
				soldCount: 1,
			});
			const service = new WarehousesProductsService(
				warehousesService as any,
			);

			// the merchant opens the product (count 10, sold 1) ...
			const [edited] = await service
				.get(STORE_ID)
				.pipe(first())
				.toPromise();
			// ... an order of 3 is placed meanwhile ...
			await orderLine(service, 3);
			// ... and the merchant saves a new price and stock
			edited.price = 999;
			edited.count = 20;
			const saved = await service.saveUpdated(STORE_ID, edited);

			expect(stock().soldCount).toBe(4);
			// merchants set the stock on purpose
			expect(stock().count).toBe(20);
			expect(stock().price).toBe(999);
			expect(saved.soldCount).toBe(4);

			const [, update] = warehousesService.updateMultiple.mock.calls[0];
			expect(update).not.toHaveProperty(['products.$.soldCount']);
			expect(update['products.$.count']).toBe(20);
		});
	});
});
