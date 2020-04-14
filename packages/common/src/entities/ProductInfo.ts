import _ from 'lodash';
import IProductInfo from '../interfaces/IProductInfo';
import Product from './Product';
import { IOrderProductCreateObject } from '../interfaces/IOrderProduct';
import WarehouseProduct from './WarehouseProduct';

/**
 * Product Information
 * Note: That entity doesn't have schema, so its not stored in db
 *
 * @class ProductInfo
 * @implements {IProductInfo}
 */
class ProductInfo implements IProductInfo {
	constructor(productInfo: IProductInfo) {
		if (productInfo) {
			_.assign(this, productInfo);

			if (productInfo.warehouseProduct) {
				this.warehouseProduct = new WarehouseProduct(
					productInfo.warehouseProduct
				);
			}
		}
	}

	/**
	 * Product field is populated inside this property
	 *
	 * @type {WarehouseProduct}
	 * @memberof ProductInfo
	 */
	warehouseProduct: WarehouseProduct;

	/**
	 * Id of merchant/store/warehouse where product is available
	 *
	 * @type {string}
	 * @memberof ProductInfo
	 */
	warehouseId: string;

	/**
	 * Url of image for merchant/store/warehouse
	 *
	 * @type {string}
	 * @memberof ProductInfo
	 */
	warehouseLogo: string;

	distance: number;

	get product(): Product {
		return this.warehouseProduct.product as Product;
	}

	getOrderProductCreateObject(count: number): IOrderProductCreateObject {
		return {
			initialPrice: this.warehouseProduct.initialPrice,
			price: this.warehouseProduct.price,
			deliveryTimeMin: this.warehouseProduct.deliveryTimeMin,
			deliveryTimeMax: this.warehouseProduct.deliveryTimeMax,
			count,
			product: this.warehouseProduct.product as Product,
		};
	}
}

export default ProductInfo;
