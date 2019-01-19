import OrderCarrierStatus from '../enums/OrderCarrierStatus';
import Order from '../entities/Order';
import { Observable } from 'rxjs';
import Carrier from '../entities/Carrier';

export interface ICarrierOrdersRouterGetOptions {
	populateWarehouse: boolean;
	completion: 'completed' | 'not-completed' | 'all';
}

export interface ICarrierOrdersRouterGetAvailableOptions {
	populateWarehouse: boolean;
}

interface ICarrierOrdersRouter {
	get(
		id: Carrier['id'],
		options?: ICarrierOrdersRouterGetOptions
	): Observable<Order[]>;

	getAvailable(
		id: Carrier['id'],
		options?: ICarrierOrdersRouterGetAvailableOptions
	): Observable<Order[]>;

	selectedForDelivery(
		carrierId: Carrier['id'],
		orderIds: Array<Order['id']>
	): Promise<Carrier>;

	updateStatus(
		carrierId: Carrier['id'],
		newStatus: OrderCarrierStatus
	): Promise<Carrier>;

	cancelDelivery(
		carrierId: Carrier['id'],
		orderIds: Array<Order['id']>
	): Promise<Carrier>;

	getCount(carrierId: Carrier['id']): Promise<number>;

	skipOrders(
		carrierId: Carrier['id'],
		ordersIds: Array<Order['id']>
	): Promise<Carrier>;
}

export default ICarrierOrdersRouter;
