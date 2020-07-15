import { Observable } from 'rxjs';
import Order from '../entities/Order';
import OrderCarrierStatus from '../enums/OrderCarrierStatus';
import OrderWarehouseStatus from '../enums/OrderWarehouseStatus';
import Warehouse from '../entities/Warehouse';

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

	payWithStripe(orderId: Order['id'], cardId: string): Promise<Order>;

	refundWithStripe(orderId: Order['id']): Promise<Order>;
}

export default IOrderRouter;
