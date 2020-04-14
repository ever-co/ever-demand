import IWarehouseProduct, {
	IWarehouseProductCreateObject,
} from './IWarehouseProduct';
import IGeoLocation, { IGeoLocationCreateObject } from './IGeoLocation';
import { DBCreateObject, DBRawObject, PyroObjectId } from '../@pyro/db';
import ForwardOrdersMethod from '../enums/ForwardOrdersMethod';
import OrderBarcodeTypes from '../enums/OrderBarcodeTypes';
import IPaymentGatewayCreateObject, {
	IPaymentGateway,
} from './IPaymentGateway';

export interface IWarehouseCreateObject extends DBCreateObject {
	/**
	 * Is Warehouse working now
	 *
	 * @type {boolean}
	 * @memberof IWarehouseCreateObject
	 */
	isActive?: boolean;

	/**
	 * Is Payment enabled (Warehouse may decide to accept only cash or accept also online payments)
	 *
	 * @type {boolean}
	 * @memberof IWarehouseCreateObject
	 */
	isPaymentEnabled?: boolean;

	/**
	 * Warehouse current location (we support 'moving' warehouses/merchants)
	 *
	 * @type {IGeoLocationCreateObject}
	 * @memberof IWarehouseCreateObject
	 */
	geoLocation: IGeoLocationCreateObject;

	/**
	 * Products available at this warehouse for customer to purchase
	 *
	 * @type {IWarehouseProductCreateObject[]}
	 * @memberof IWarehouseCreateObject
	 */
	products?: IWarehouseProductCreateObject[];

	name: string;

	/**
	 * URL of Merchant/Warehouse brand logo
	 *
	 * @type {string}
	 * @memberof IWarehouseCreateObject
	 */
	logo: string;

	/**
	 * Merchant admin user name
	 *
	 * @type {string}
	 * @memberof IWarehouseCreateObject
	 */
	username: string;

	contactEmail: string | null;
	contactPhone: string | null;

	ordersEmail: string | null;
	ordersPhone: string | null;

	/**
	 * The way how Orders forwarded to Merchant (email, phone, etc)
	 *
	 * @type {ForwardOrdersMethod}
	 * @memberof IWarehouseCreateObject
	 */
	forwardOrdersUsing: ForwardOrdersMethod[];

	/**
	 * Is Warehouse products by default require manufacturing
	 *
	 * @type {boolean}
	 * @memberof IWarehouseCreateObject
	 */
	isManufacturing?: boolean;

	/**
	 * Is warehouse products by default become available only when carrier found
	 * (should we search for carrier before or after customer purchases product)
	 *
	 * @type {boolean}
	 * @memberof IWarehouseCreateObject
	 */
	isCarrierRequired?: boolean;

	devicesIds?: string[];

	usedCarriersIds?: string[];

	/**
	 * Merchant may use own carriers or use carriers shared between multiple merchants (e.g. from global catalog)
	 *
	 * @type {boolean}
	 * @memberof IWarehouseCreateObject
	 */
	hasRestrictedCarriers?: boolean;
	carriersIds?: string[];

	/**
	 * Password hash
	 *
	 * @type {string}
	 * @memberof IWarehouseCreateObject
	 */
	hash?: string;

	/**
	 * Payment Gateways
	 *
	 * @type {IPaymentGatewayCreateObject[]}
	 * @memberof IWarehouseCreateObject
	 */
	paymentGateways?: IPaymentGatewayCreateObject[];

	productsDelivery?: boolean;
	productsTakeaway?: boolean;
	orderBarcodeType?: OrderBarcodeTypes;
	barcodeData?: string;
	useOnlyRestrictedCarriersForDelivery?: boolean;
	preferRestrictedCarriersForDelivery?: boolean;
}

interface IWarehouse extends IWarehouseCreateObject, DBRawObject {
	_id: PyroObjectId;
	geoLocation: IGeoLocation;
	isActive: boolean;
	products: IWarehouseProduct[];
	isManufacturing: boolean;
	isCarrierRequired: boolean;
	devicesIds?: string[];
	usedCarriersIds: string[];
	hasRestrictedCarriers: boolean;
	barcodeData?: string;
	paymentGateways?: IPaymentGateway[];
	useOnlyRestrictedCarriersForDelivery?: boolean;
	preferRestrictedCarriersForDelivery?: boolean;
}

export default IWarehouse;
