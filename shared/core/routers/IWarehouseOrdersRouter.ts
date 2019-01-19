import { Observable } from 'rxjs';
import Order from '../entities/Order';
import Product from '../entities/Product';

export interface IWarehouseOrdersRouterGetOptions {
	populateWarehouse?: boolean;
	populateCarrier?: boolean;
	onlyAvailableToCarrier?: boolean;
}

export interface IWarehouseOrdersRouterCreateOptions {
	autoConfirm?: boolean;
}

export interface IOrderCreateInputProduct {
	count: number;
	productId: Product['id'];
}

export interface IOrderCreateInput {
	userId: string;
	warehouseId: string;
	products: IOrderCreateInputProduct[];

	options?: IWarehouseOrdersRouterCreateOptions;
}

interface IWarehouseOrdersRouter {
	get(
		warehouseId: string,
		options?: IWarehouseOrdersRouterGetOptions
	): Observable<Order[]>;

	create(createInput: IOrderCreateInput): Promise<Order>;

	cancel(orderId: string): Promise<Order>;

	createByProductType(
		userId: string,
		warehouseId: string,
		productId: string
	): Promise<Order>;
}

export default IWarehouseOrdersRouter;
