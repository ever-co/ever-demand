import IProduct from './IProduct';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

/**
 * Represent Warehouse/Merchant inventory item (some product) for sale
 * Each warehouse may have some qty of items of some product
 * and price can change for all specific products (i.e. we currently do not support price per each product 'instance')
 * E.g. say price decrease every 1 min for 1$ but for all 4 products in warehouse,
 * not just for some products of given type
 *
 * @export
 * @interface IWarehouseProductCreateObject
 * @extends {DBCreateObject}
 */
export interface IWarehouseProductCreateObject extends DBCreateObject {
	/**
	 * Price of product
	 * Note: some warehouses may have different prices for the same product (from global products catalog)
	 * compared to other warehouses.
	 *
	 * It is especially true, when prices go down/up in some warehouses more quickly compared to others, etc.
	 *
	 * @type {number}
	 * @memberof IWarehouseProductCreateObject
	 */
	price: number;

	initialPrice: number;

	/**
	 * How many products (qty)
	 *
	 * @type {number}
	 * @memberof IWarehouseProductCreateObject
	 */
	count?: number;

	/**
	 * How many products are sold
	 *
	 * @type {number}
	 * @memberof IWarehouseProductCreateObject
	 */
	soldCount?: number;

	product: IProduct | string;

	/**
	 * Is product(s) require manufacturing
	 *
	 * @type {boolean}
	 * @memberof IWarehouseProductCreateObject
	 */
	isManufacturing?: boolean;

	/**
	 * Is product aviavable
	 *
	 * @type {boolean}
	 * @memberof IWarehouseProductCreateObject
	 */
	isProductAvailable?: boolean;

	/**
	 * Is product(s) become available only when carrier found
	 *
	 * @type {boolean}
	 * @memberof IWarehouseProductCreateObject
	 */
	isCarrierRequired?: boolean;

	/**
	 * true - Delivery required, false - Takeaway
	 *
	 * @type {boolean}
	 * @memberof IWarehouseProductCreateObject
	 */
	isDeliveryRequired?: boolean;

	isTakeaway?: boolean;

	/**
	 * Min delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof IWarehouseProductCreateObject
	 */
	deliveryTimeMin?: number;

	/**
	 * Max delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof IWarehouseProductCreateObject
	 */
	deliveryTimeMax?: number;
}

interface IWarehouseProduct extends IWarehouseProductCreateObject, DBRawObject {
	_id: PyroObjectId;

	count: number;

	product: IProduct | string;

	isManufacturing: boolean;

	isCarrierRequired: boolean;

	isDeliveryRequired: boolean;

	isTakeaway?: boolean;

	isProductAvailable?: boolean;
}

export default IWarehouseProduct;
