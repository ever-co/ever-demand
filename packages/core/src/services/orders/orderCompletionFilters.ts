import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';

/**
 * Mongo filter for completed orders: paid and delivered, or cancelled.
 * It is the same rule as `Order.isCompleted`.
 */
export const isCompletedOrderFilter = {
	$or: [
		{
			isPaid: true,
			carrierStatus: OrderCarrierStatus.DeliveryCompleted,
		},
		{
			isCancelled: true,
		},
	],
};

/**
 * Mongo filter for orders that are not completed yet: the exact complement
 * of `isCompletedOrderFilter` (not cancelled, and not paid or not delivered).
 *
 * An order paid by card in the shop is paid before delivery. It must still
 * match here, or carrier status updates (`CarriersOrdersService.updateStatus`)
 * and the carrier's not-completed order lists skip it.
 */
export const isNotCompletedOrderFilter = {
	isCancelled: false,
	$or: [
		{
			isPaid: false,
		},
		{
			carrierStatus: {
				$ne: OrderCarrierStatus.DeliveryCompleted,
			},
		},
	],
};

/**
 * Both filters, as exposed by `OrdersService.FindObjects`.
 */
export const orderCompletionFilters = {
	isCompleted: isCompletedOrderFilter,
	isNotCompleted: isNotCompletedOrderFilter,
};
