import Product from './Product';
import { Schema, DBObject, ModelName, getSchema, Types } from '../@pyro/db';
import IOrderProduct from '../interfaces/IOrderProduct';
import { IOrderProductCreateObject } from '../interfaces/IOrderProduct';
import { Column } from 'typeorm';

/**
 * Store Product information inside Order (similar to OrderLineItem concept)
 *
 * @class OrderProduct
 * @extends {DBObject<IOrderProduct, IOrderProductCreateObject>}
 * @implements {IOrderProduct}
 */
@ModelName('OrderProduct')
class OrderProduct extends DBObject<IOrderProduct, IOrderProductCreateObject>
	implements IOrderProduct {
	constructor(orderProduct: IOrderProduct) {
		super(orderProduct);

		if (orderProduct && orderProduct.product) {
			this.product = new Product(orderProduct.product);
		}
	}

	// current price of the Product (could be lower or higher compared to initial price)
	@Types.Number()
	@Column()
	price: number;

	// initial price of the Product
	@Types.Number()
	@Column()
	initialPrice: number;

	/**
	 * Qty of purchased products
	 *
	 * @type {number}
	 * @memberof OrderProduct
	 */
	@Types.Number(0)
	@Column()
	count: number;

	/**
	 * Product (not ref)
	 *
	 * @type {Product}
	 * @memberof OrderProduct
	 */
	@Schema(getSchema(Product))
	product: Product;

	/**
	 * Is product(s) require manufacturing
	 *
	 * @type {boolean}
	 * @memberof OrderProduct
	 */
	@Types.Boolean(true)
	@Column()
	isManufacturing: boolean;

	/**
	 * Is product(s) becomes available for purchase only when carrier found
	 *
	 * @type {boolean}
	 * @memberof OrderProduct
	 */
	@Types.Boolean(true)
	@Column()
	isCarrierRequired: boolean;

	/**
	 * Should product be delivered by carrier or it's pickup (takeaway)
	 *
	 * @type {boolean}
	 * @memberof OrderProduct
	 */
	@Types.Boolean(true)
	@Column()
	isDeliveryRequired: boolean;

	/**
	 * Is it Takeaway order (including in-store purchase)
	 *
	 * @type {boolean}
	 * @memberof OrderProduct
	 */
	@Schema({ required: false, type: Boolean })
	@Column()
	isTakeaway?: boolean;

	/**
	 * Min delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof OrderProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMin?: number;

	/**
	 * Max delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof OrderProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMax?: number;
}

export default OrderProduct;
