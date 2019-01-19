import IWarehouseProduct from './IWarehouseProduct';

interface IProductInfo {
	/**
	 * Where product field is populated!
	 *
	 * @type {IWarehouseProduct}
	 * @memberof IProductInfo
	 */
	warehouseProduct: IWarehouseProduct;

	distance: number;

	/**
	 * Id of warehouse where product is available
	 *
	 * @type {string}
	 * @memberof IProductInfo
	 */
	warehouseId: string;

	warehouseLogo: string;
}

export default IProductInfo;
