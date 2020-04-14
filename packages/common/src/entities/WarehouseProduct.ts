import Product from './Product';
import { DBObject, ModelName, Schema, Types } from '../@pyro/db';
import IWarehouseProduct, {
	IWarehouseProductCreateObject,
} from '../interfaces/IWarehouseProduct';
import IProduct from '../interfaces/IProduct';
import { Column } from 'typeorm';

/**
 * Represent Warehouse (Merchant) inventory item (some product / service) for sale
 * Each warehouse may have some qty of items of some product and price can change for all of
 * them only (i.e. say price decrease every 1 min for 1$ but for all 4 products in warehouse)
 * In MongoDB stored as sub-documents inside Warehouse document (not as a separate collection)
 *
 * @class WarehouseProduct
 * @extends {DBObject<IWarehouseProduct, IWarehouseProductCreateObject>}
 * @implements {IWarehouseProduct}
 */
@ModelName('WarehouseProduct')
class WarehouseProduct
	extends DBObject<IWarehouseProduct, IWarehouseProductCreateObject>
	implements IWarehouseProduct {
	constructor(warehouseProduct: IWarehouseProduct) {
		super(warehouseProduct);

		if (typeof warehouseProduct.product !== 'string') {
			this.product = new Product(warehouseProduct.product as IProduct);
		}
	}

	/**
	 * Current Price of product (real-time)
	 * Note: some warehouses may have different prices for the same product
	 * compared to other warehouses.  It is especially true, when prices go down/up in some
	 * warehouses more quickly compared to others etc
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number()
	@Column()
	price: number;

	/**
	 * Start price for product.
	 * Initially equals to the value from price field, but over the time price can go down/up,
	 * while initialPrice will always remain the same.
	 * We calculate % of discount using price and initialPrice values
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number()
	@Column()
	initialPrice: number;

	/**
	 * How many products available currently for purchase
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number(0)
	@Column()
	count: number;

	/**
	 * How many products are sold
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Types.Number(0)
	@Column()
	soldCount: number;

	/**
	 * Ref to Product
	 *
	 * @type {(Product | string)}
	 * @memberof WarehouseProduct
	 */
	@Types.Ref(Product)
	product: Product | string;

	/**
	 * Is product(s) require manufacturing
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isManufacturing: boolean;

	/**
	 * Is product(s) become available only when carrier found
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isCarrierRequired: boolean;

	/**
	 * Is product(s) require delivery to customer or available for pickup
	 *
	 * @type {boolean}
	 * @memberof WarehouseProduct
	 */
	@Column()
	@Types.Boolean(true)
	isDeliveryRequired: boolean;

	@Schema({ required: false, type: Boolean })
	@Column()
	isTakeaway?: boolean;

	/**
	 * Min delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMin?: number;

	/**
	 * Max delivery time (in minutes)
	 *
	 * @type {number}
	 * @memberof WarehouseProduct
	 */
	@Schema({ required: false, type: Number })
	@Column()
	deliveryTimeMax?: number;

	/**
	 * Get ProductId
	 *
	 * @readonly
	 * @type {string}
	 * @memberof WarehouseProduct
	 */
	get productId(): string {
		if (typeof this.product === 'string') {
			return this.product as string;
		} else {
			return (this.product as Product).id;
		}
	}
}

export type WithPopulatedProduct = WarehouseProduct & { product: Product };

export default WarehouseProduct;
