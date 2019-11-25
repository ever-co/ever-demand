import Order from '@modules/server.common/entities/Order';
import OrderStatus from '@modules/server.common/enums/OrderStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import _ from 'lodash';

export type OrdersFilterModes =
	| 'ready'
	| 'in_delivery'
	| 'not_confirmed'
	| 'cancelled'
	| 'all';

export type OrdersFilter = (
	orders: Order[],
	mode: OrdersFilterModes
) => Order[];

export function ordersFilter(orders: Order[], mode: OrdersFilterModes) {
	function isMatching(ordersMode: OrdersFilterModes, order: Order) {
		switch (ordersMode) {
			// orders which are ready to be ship to the customer
			case 'ready':
				return (
					(order.status === OrderStatus.WarehousePreparation ||
						(order.status === OrderStatus.InDelivery &&
							order.warehouseStatus ===
								OrderWarehouseStatus.PackagingFinished)) &&
					order.warehouseStatus !==
						OrderWarehouseStatus.GivenToCustomer
				);

			// orders in delivery stage
			case 'in_delivery':
				return order.status === OrderStatus.InDelivery;

			// orders which are not completed yet (not confirmed yet by client)
			case 'not_confirmed':
				return (
					!order.isConfirmed &&
					!order.isCancelled &&
					!order.isCompleted
				);

			case 'cancelled':
				return order.isCancelled;

			case 'all':
			default:
				return true;
		}
	}

	return _.filter(orders, (order: Order) => isMatching(mode, order));
}
