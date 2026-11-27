import { injectable } from 'inversify';
import { createEverLogger } from '../../helpers/Log';
import Logger from 'bunyan';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { WarehousesService } from './WarehousesService';
import IWarehouseProduct, {
	IWarehouseProductCreateObject,
} from '@modules/server.common/interfaces/IWarehouseProduct';
import * as _ from 'lodash';
import Warehouse from '@modules/server.common/entities/Warehouse';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import { ExistenceEventType } from '@pyro/db-server';
import { Observable, throwError } from 'rxjs';
import IWarehouseProductsRouter from '@modules/server.common/routers/IWarehouseProductsRouter';
import {
	asyncListener,
	observableListener,
	routerName,
	serialization,
} from '@pyro/io';
import IProduct from '@modules/server.common/interfaces/IProduct';
import IService from '../IService';
import { exhaustMap, first, map } from 'rxjs/operators';
import { of } from 'rxjs';
import mongoose = require('mongoose');
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import { paginateBySoldCount } from './paginateBySoldCount';

const noGetProductTypeMessage = `There should be true at least one of the two - "isCarrierRequired" or "isTakeaway"!`;

/**
 * Warehouses Products Service
 *
 * @export
 * @class WarehousesProductsService
 * @implements {IWarehouseProductsRouter}
 * @implements {IService}
 */
/**
 * `$set` of every field of a warehouse product, matched by the positional
 * `products.$`. The element is not replaced as a whole (`'products.$': obj`):
 * Mongoose 7+ then also sets `products.$._updatedAt` (sub-document
 * timestamps), a path MongoDB refuses next to `products.$`.
 */
export function warehouseProductUpdate(
	warehouseProduct: WarehouseProduct
): Record<string, unknown> {
	const update: Record<string, unknown> = {};

	for (const [field, value] of Object.entries(warehouseProduct)) {
		if (
			value !== undefined &&
			!['_id', '_createdAt', '_updatedAt'].includes(field)
		) {
			update[`products.$.${field}`] = value;
		}
	}

	return update;
}

/**
 * Filter of the store `warehouseId` (not deleted) holding the product
 * `productId`, with `productConditions` on that product. An update's
 * positional `products.$` is the element `$elemMatch` matched.
 */
function warehouseProductFilter(
	warehouseId: string,
	productId: string,
	productConditions: Record<string, unknown> = {}
): Record<string, unknown> {
	return {
		_id: new mongoose.Types.ObjectId(warehouseId),
		isDeleted: { $eq: false },
		products: {
			$elemMatch: {
				product: new mongoose.Types.ObjectId(productId),
				...productConditions,
			},
		},
	};
}

@injectable()
@routerName('warehouse-products')
export class WarehousesProductsService
	implements IWarehouseProductsRouter, IService {
	protected readonly log: Logger = createEverLogger({
		name: 'warehouseProductsService',
	});

	constructor(private readonly warehousesService: WarehousesService) {}

	/**
	 * Get all products for given warehouse (not only available, but all assigned)
	 *
	 * @param {string} warehouseId
	 * @param {boolean} [fullProducts=true] if true, include full products details
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	get(
		warehouseId: string,
		fullProducts: boolean = true
	): Observable<WarehouseProduct[]> {
		return this.warehousesService.get(warehouseId, fullProducts).pipe(
			exhaustMap((warehouse: Warehouse) => {
				if (warehouse === null) {
					return throwError(() =>
						new Error(
							`Warehouse with the id ${warehouseId} doesn't exist`
						)
					);
				} else {
					return of(warehouse);
				}
			}),
			map((warehouse: Warehouse) => warehouse.products)
		);
	}

	@asyncListener()
	async getProductsWithPagination(
		id: string,
		pagingOptions: IPagingOptions
	): Promise<WarehouseProduct[]> {
		const allProducts = await this.get(id).pipe(first()).toPromise();

		return paginateBySoldCount(allProducts, pagingOptions);
	}

	@asyncListener()
	async getProductsCount(id: string) {
		const allProducts = await this.get(id).pipe(first()).toPromise();

		return allProducts.length;
	}

	/**
	 * Get products for given warehouse which available for purchase
	 *
	 * @param {string} warehouseId
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	getAvailable(warehouseId: string): Observable<WarehouseProduct[]> {
		return this.get(warehouseId).pipe(
			map((warehouseProducts) =>
				_.filter(
					warehouseProducts,
					(warehouseProduct) =>
						warehouseProduct.count > 0 &&
						warehouseProduct.isProductAvailable === true
				)
			)
		);
	}

	/**
	 * Remove products from warehouse
	 *
	 * @param {string} warehouseId
	 * @param {string[]} productsIds
	 * @returns {Promise<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async remove(
		warehouseId: string,
		productsIds: string[]
	): Promise<WarehouseProduct[]> {
		this.log.info('Removing products ' + productsIds);

		const warehouse = await this.warehousesService
			.get(warehouseId, true)
			.pipe(first())
			.toPromise();

		if (warehouse == null) {
			throw new Error(`There is no warehouse with the id ${warehouse}!`);
		}

		warehouse.products = warehouse.products.filter((p) => {
			if (!p.product['_id']) {
				return false;
			}

			const productId = p.product['id'];
			return !productsIds.includes(productId);
		});
		await this.warehousesService._save(warehouse);

		return warehouse.products;
	}

	/**
	 * Add products to warehouse
	 * TODO: should "merge" products, not just add them!
	 * By merge I mean increase qty if product already in warehouse or add new product if it's not.
	 * We also should think what to do with prices?
	 * Is it possible to have 2 same products but come with different price?
	 * Or we should merge products and use latest price?
	 *
	 * @param {string} warehouseId
	 * @param {IWarehouseProductCreateObject[]} products
	 * @param {boolean} [triggerChange=true]
	 * @returns {Promise<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async add(
		warehouseId: string,
		products: IWarehouseProductCreateObject[],
		triggerChange: boolean = true
	): Promise<WarehouseProduct[]> {
		// TODO: use atomic operations (e.g.:findAndModify) or 2 phase commit
		// see http://blog.ocliw.com/2012/11/25/mongoose-add-to-an-existing-array/

		this.log.info('Adding products ' + JSON.stringify(products));

		let warehouse = await this.warehousesService
			.get(warehouseId, false)
			.pipe(first())
			.toPromise(); // products not populated!

		if (warehouse == null) {
			throw new Error(`There is no warehouse with the id ${warehouse}!`);
		}

		const notUpdatedWarehouse = _.clone(warehouse);

		// In practice to make it more reliable, we should go one by one, i.e. one product a time
		// and each time execute atomic operation on each product.
		// Say if product already there, we want to increase count using atomic operation by given value in the storage.
		// etc

		let newProds: IWarehouseProductCreateObject[];

		if (warehouse.products && warehouse.products.length > 0) {
			newProds = _.clone(warehouse.products);

			_.each(products, (product) => {
				if (!product.isDeliveryRequired && !product.isTakeaway) {
					product.isDeliveryRequired = true;
				}
				const existed = _.find(
					newProds,
					(newProd) =>
						(newProd.product as string) ===
						(product.product as string)
				);

				if (
					typeof existed === 'undefined' ||
					existed === undefined ||
					existed == null
				) {
					newProds.push(product); // if no such product existed yet, we add it
				} else {
					// if product with same id already exists, we should increase his qty
					if (existed.count && product.count) {
						existed.count += product.count;
					} else {
						existed.count = product.count;
					}
					// should we merge price here? What if new products come with new price,
					// should we make "average" price in warehouse or use latest price instead?
				}
			});
		} else {
			newProds = products;
		}

		try {
			warehouse = new Warehouse(
				(await this.warehousesService.Model.findByIdAndUpdate(
					warehouseId,
					{
						$set: { products: newProds },
					},
					{ new: true }
				)
					.populate('products.product')
					.lean()
					.exec()) as IWarehouse
			);
		} catch (error) {
			this.log.error(error);
			throw error;
		}

		if (triggerChange) {
			this.warehousesService.existence.next({
				id: warehouse.id,
				value: warehouse,
				lastValue: notUpdatedWarehouse,
				type: ExistenceEventType.Updated,
			});
		}

		const newProdsIds = _.map(newProds, (warehouseProduct) => {
			if (typeof warehouseProduct.product === 'string') {
				return warehouseProduct.product as string;
			} else {
				return (warehouseProduct.product as IProduct)._id.toString();
			}
		});

		return _.filter(warehouse.products, (warehouseProduct) => {
			return _.includes(newProdsIds, warehouseProduct.productId);
		});
	}

	/**
	 * Increase inventory of given product using existed product price by given count
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async increaseCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		// we want to add given qty of such products
		return this._incProductCounter(warehouseId, productId, 'count', count, {
			warehouse: 'Cannot find warehouse',
			product: 'Cannot find product',
		});
	}

	/**
	 * Increase sold qty of given product by given count
	 * If no such product exists in warehouse yet, do nothing
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async increaseSoldCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		// we want to add given qty of such products
		return this._incProductCounter(
			warehouseId,
			productId,
			'soldCount',
			count,
			{
				warehouse: 'Cannot find warehouse',
				product: 'Cannot find product',
			}
		);
	}

	/**
	 * TODO: document
	 *
	 * @param {string} warehouseId
	 * @param {WarehouseProduct} _updatedWarehouseProduct
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async saveUpdated(
		warehouseId: string,
		@serialization((u: IWarehouseProduct) => new WarehouseProduct(u))
		_updatedWarehouseProduct: WarehouseProduct
	): Promise<WarehouseProduct> {
		await this.warehousesService.throwIfNotExists(warehouseId);
		if (
			!_updatedWarehouseProduct.isDeliveryRequired &&
			!_updatedWarehouseProduct.isTakeaway
		) {
			throw new Error(noGetProductTypeMessage);
		}

		const updatedWarehouseProduct = _.clone(_updatedWarehouseProduct);
		// The warehouse stores the product as a ref (its id), but the product
		// is usually populated here: write the id, as the original code did.
		// Mongoose refuses to cast a Product object to the ref.
		updatedWarehouseProduct.product = updatedWarehouseProduct.productId as any;

		const updatedWarehouse = (
			await this.warehousesService.updateMultiple(
				{
					_id: new mongoose.Types.ObjectId(warehouseId),
					'products._id': updatedWarehouseProduct._id,
				},
				warehouseProductUpdate(updatedWarehouseProduct)
			)
		)[0];

		return _.find(
			updatedWarehouse.products,
			(warehouseProduct) =>
				warehouseProduct.productId === updatedWarehouseProduct.productId
		) as WarehouseProduct;
	}

	/**
	 * Change price for the product
	 *
	 * @param {string} warehouseId
	 * @param {string} productId which product price should be changed
	 * @param {number} price new price
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async changePrice(
		warehouseId: string,
		productId: string,
		price: number
	): Promise<WarehouseProduct> {
		// TODO: Some global distributed lock should be apply here
		// so we can't change product price on 2 separate servers at the same time?

		const warehouse = await this.warehousesService
			.get(warehouseId, false)
			.pipe(first())
			.toPromise();

		if (warehouse == null) {
			throw new Error(
				`There is no such an warehouse with the id ${warehouseId}`
			);
		}

		this.log.info(
			'Change product price requested in warehouse: ' +
				JSON.stringify(warehouse) +
				' for product id: ' +
				productId
		);

		const product = _.find(
			warehouse.products,
			(p) => p.productId === productId
		);

		if (product != null) {
			this.log.info(
				`Product price before: ${product.price} and we want to change it to: ${price}`
			);

			// Only the price: the other fields of this read (count,
			// soldCount, ...) may be old by now.
			const updatedWarehouse = (
				await this.warehousesService.updateMultiple(
					warehouseProductFilter(warehouseId, productId),
					{ $set: { 'products.$.price': price } }
				)
			)[0];

			const updatedProduct =
				updatedWarehouse &&
				_.find(
					updatedWarehouse.products,
					(warehouseProduct) =>
						warehouseProduct.productId === productId
				);

			if (updatedProduct == null) {
				throw new Error(
					`There is no such an product with the id ${productId} in the warehouse with the id ${warehouseId}`
				);
			}

			return updatedProduct;
		} else {
			throw new Error(
				`There is no such an product with the id ${productId} in the warehouse with the id ${warehouseId}`
			);
		}
	}

	/**
	 * Removes products from warehouse (called during sell of the product)
	 * Always cause change notification to be send to the clients
	 *
	 * @param {string} warehouseId
	 * @param {string} productId what product availability should be decreased
	 * @param {number} count how many to remove
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async decreaseCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		this.log.info(
			`Remove requested in warehouse: ${warehouseId} for product id: ${productId}, count: ${count}`
		);

		// One write that MongoDB checks against the stock, so concurrent
		// orders (on any server) cannot both take the last items.
		return this._incProductCounter(
			warehouseId,
			productId,
			'count',
			-count,
			{
				warehouse: `Cannot find warehouse: ${warehouseId}`,
				product: `There is no such an product with the id ${productId} in the warehouse with the id ${warehouseId}`,
				notEnough: 'Request to remove more products than available',
			}
		);
	}

	/**
	 * Decrease products sold count from warehouse (called during the order cancel)
	 *
	 * @param {string} warehouseId
	 * @param {string} productId
	 * @param {number} count
	 * @returns {Promise<WarehouseProduct>}
	 * @memberof WarehousesProductsService
	 */
	@asyncListener()
	async decreaseSoldCount(
		warehouseId: string,
		productId: string,
		count: number
	): Promise<WarehouseProduct> {
		this.log.info(
			`Sold count decrease requested in warehouse: ${warehouseId} for product id: ${productId}, count: ${count}`
		);

		return this._incProductCounter(
			warehouseId,
			productId,
			'soldCount',
			-count,
			{
				warehouse: `Cannot find warehouse: ${warehouseId}`,
				product: `There is no such an product with the id ${productId} in the warehouse with the id ${warehouseId}`,
				notEnough:
					'Request to decrease count of more products than available',
			}
		);
	}

	/**
	 * Get Top sold products from given Warehouse
	 *
	 * @param {string} warehouseId warehouse from which to return products
	 * @param {number} quantity how many products to return
	 * @returns {Observable<WarehouseProduct[]>}
	 * @memberof WarehousesProductsService
	 */
	@observableListener()
	getTopProducts(
		warehouseId: string,
		quantity: number
	): Observable<WarehouseProduct[]> {
		return this.get(warehouseId).pipe(
			map((warehouseProducts) => {
				let topProducts = _.filter(
					warehouseProducts,
					(warehouseProduct) => warehouseProduct.soldCount > 0
				);

				topProducts = _.orderBy(topProducts, ['soldCount'], ['desc']);

				return _.take(topProducts, quantity);
			})
		);
	}

	@observableListener()
	getProduct(
		warehouseId: string,
		warehouseProductId: string
	): Observable<WarehouseProduct> {
		return this.warehousesService.get(warehouseId, true).pipe(
			exhaustMap((warehouse) => {
				if (warehouse === null) {
					return throwError( () =>
						new Error(
							`Warehouse with the id ${warehouseId} doesn't exist`
						)
					);
				} else {
					return of(warehouse);
				}
			}),
			map((warehouse) =>
				warehouse.products.find((p) => p.id === warehouseProductId)
			)
		);
	}

	@asyncListener()
	async changeProductAvailability(
		warehouseId: string,
		productId: string,
		isAvailable: boolean
	): Promise<WarehouseProduct> {
		const warehouse = await this.warehousesService
			.get(warehouseId)
			.pipe(first())
			.toPromise();
		if (warehouse) {
			const existedProduct = _.find(
				warehouse.products,
				(warehouseProduct) => warehouseProduct.productId === productId
			);

			if (existedProduct) {
				existedProduct.isProductAvailable = isAvailable;

				return this.saveUpdated(warehouseId, existedProduct);
			} else {
				const errMsg = 'Cannot find product';
				this.log.error(new Error(errMsg));
				throw new Error(errMsg);
			}
		} else {
			const errMsg = 'Cannot find warehouse';
			this.log.error(new Error(errMsg));
			throw new Error(errMsg);
		}
	}
	@asyncListener()
	async changeProductTakeaway(
		warehouseId: string,
		productId: string,
		isTakeaway: boolean
	): Promise<WarehouseProduct> {
		const warehouse = await this.warehousesService
			.get(warehouseId)
			.pipe(first())
			.toPromise();
		if (warehouse) {
			const existedProduct = _.find(
				warehouse.products,
				(warehouseProduct) => warehouseProduct.productId === productId
			);

			if (existedProduct) {
				existedProduct.isTakeaway = isTakeaway;

				return this.saveUpdated(warehouseId, existedProduct);
			} else {
				const errMsg = 'Cannot find product';
				this.log.error(new Error(errMsg));
				throw new Error(errMsg);
			}
		} else {
			const errMsg = 'Cannot find warehouse';
			this.log.error(new Error(errMsg));
			throw new Error(errMsg);
		}
	}
	@asyncListener()
	async changeProductDelivery(
		warehouseId: string,
		productId: string,
		isDelivery: boolean
	): Promise<WarehouseProduct> {
		const warehouse = await this.warehousesService
			.get(warehouseId)
			.pipe(first())
			.toPromise();
		if (warehouse) {
			const existedProduct = _.find(
				warehouse.products,
				(warehouseProduct) => warehouseProduct.productId === productId
			);

			if (existedProduct) {
				existedProduct.isDeliveryRequired = isDelivery;

				return this.saveUpdated(warehouseId, existedProduct);
			} else {
				const errMsg = 'Cannot find product';
				this.log.error(new Error(errMsg));
				throw new Error(errMsg);
			}
		} else {
			const errMsg = 'Cannot find warehouse';
			this.log.error(new Error(errMsg));
			throw new Error(errMsg);
		}
	}

	/**
	 * Adds `by` to the `field` counter of the product `productId` in the
	 * store `warehouseId` with one `$inc`, so concurrent changes add up
	 * instead of each writing back the value it read. A decrease (`by` < 0)
	 * matches only while the counter holds at least `-by`, so it never goes
	 * below zero.
	 *
	 * When the write matched nothing, reads the store to throw the right one
	 * of `errors`.
	 */
	private async _incProductCounter(
		warehouseId: string,
		productId: string,
		field: 'count' | 'soldCount',
		by: number,
		errors: { warehouse: string; product: string; notEnough?: string }
	): Promise<WarehouseProduct> {
		const updatedWarehouse = (
			await this.warehousesService.updateMultiple(
				warehouseProductFilter(
					warehouseId,
					productId,
					by < 0 ? { [field]: { $gte: -by } } : {}
				),
				{ $inc: { [`products.$.${field}`]: by } }
			)
		)[0];

		const updatedProduct =
			updatedWarehouse &&
			_.find(
				updatedWarehouse.products,
				(warehouseProduct) => warehouseProduct.productId === productId
			);

		if (updatedProduct != null) {
			return updatedProduct;
		}

		const warehouse = await this.warehousesService.getCurrent(warehouseId);

		let errMsg = errors.product;
		let product: WarehouseProduct | undefined;

		if (warehouse == null || warehouse.isDeleted) {
			errMsg = errors.warehouse;
		} else {
			product = _.find(
				warehouse.products,
				(warehouseProduct) => warehouseProduct.productId === productId
			);

			if (product != null && errors.notEnough != null) {
				errMsg = errors.notEnough;
			}
		}

		this.log.error({ err: new Error(errMsg), product, field, by });
		throw new Error(errMsg);
	}
}
