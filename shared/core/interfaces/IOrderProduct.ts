import IProduct from './IProduct';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';

export interface IOrderProductCreateObject extends DBCreateObject {
	initialPrice: number;
	price: number;
	count: number;
	product: IProduct;

	/**
	 * Min delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof IOrderProductCreateObject
	 */
	deliveryTimeMin?: number;

	/**
	 * Max delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof IOrderProductCreateObject
	 */
	deliveryTimeMax?: number;

	/**
	 * Is product(s) require manufacturing
	 *
	 * @type {boolean}
	 * @memberof IOrderProductCreateObject
	 */
	isManufacturing?: boolean;

	/**
	 * Is product(s) become available only when carrier found
	 *
	 * @type {boolean}
	 * @memberof IOrderProductCreateObject
	 */
	isCarrierRequired?: boolean;
	isDeliveryRequired?: boolean;
	isTakeaway?: boolean;
}

interface IOrderProduct extends IOrderProductCreateObject, DBRawObject {
	_id: PyroObjectId;
	isManufacturing: boolean;
	isCarrierRequired: boolean;
	isDeliveryRequired: boolean;
	isTakeaway?: boolean;
}

export default IOrderProduct;
