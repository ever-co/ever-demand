import { Observable } from 'rxjs';
import Order from '../entities/Order';
import OrderCarrierStatus from '../enums/OrderCarrierStatus';
import OrderWarehouseStatus from '../enums/OrderWarehouseStatus';
import Warehouse from '../entities/Warehouse';

/**
 * Error name of a payWithStripe call refused because the charge currency
 * is not the one the customer was shown, e.g. after a restart with a new
 * STRIPE_CURRENCY. The shop then loads the currency again.
 */
export const STRIPE_CURRENCY_CHANGED_ERROR = 'StripeCurrencyChangedError';

/**
 * Error name of a payWithStripe call refused because the order is paid
 * already, e.g. by an earlier call whose answer the socket lost, or from
 * another device. The shop then says the order is paid, not that the
 * payment failed.
 */
export const ORDER_ALREADY_PAID_ERROR = 'OrderAlreadyPaidError';

export interface IOrderRouterGetOptions {
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
}

interface IOrderRouter {
	get(
		id: Order['id'],
		options?: IOrderRouterGetOptions
	): Observable<Order | null>;

	confirm(orderId: Order['id']): Promise<Order>;

	updateCarrierStatus(
		orderId: Order['id'],
		status: OrderCarrierStatus
	): Promise<Order>;

	updateWarehouseStatus(
		orderId: Order['id'],
		status: OrderWarehouseStatus
	): Promise<Order>;

	addProducts(
		orderId: Order['id'],
		products,
		warehouseId: Warehouse['id']
	): Promise<Order>;

	removeProducts(orderId: Order['id'], productsIds: string[]): Promise<Order>;

	/**
	 * @param shownCurrency currency the customer was shown, if any. The
	 * server refuses the charge when it is not the charge currency.
	 */
	payWithStripe(
		orderId: Order['id'],
		cardId: string,
		shownCurrency?: string
	): Promise<Order>;

	/**
	 * Currency payWithStripe charges in: a lower-case code, e.g. `usd`
	 */
	getStripeCurrency(): Promise<string>;

	refundWithStripe(orderId: Order['id']): Promise<Order>;
}

export default IOrderRouter;
