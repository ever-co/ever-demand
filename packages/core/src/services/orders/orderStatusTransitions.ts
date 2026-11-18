import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

/**
 * Allowed order status transitions.
 *
 * Rules (for both carrier and warehouse statuses):
 *  - Setting the status an order already has is always allowed (idempotent retries from mobile apps).
 *  - The regular flow only moves forward (steps may be skipped, never reverted).
 *  - A failure/issue status can be reached from any non-final status.
 *  - A failure status can only be recovered to the stages that retry the failed work
 *    (never to another failure status).
 *  - The client can refuse the order only after the carrier arrived or after an issue.
 *  - Final statuses (delivered / given to customer / client refused) cannot be changed.
 */

type TransitionTable<T extends number> = Map<T, ReadonlySet<T>>;

function buildTable<T extends number>(
	flow: T[],
	failures: T[],
	finalStatuses: T[],
	recoveries: Array<[T, T[]]>
): TransitionTable<T> {
	const table: TransitionTable<T> = new Map();

	flow.forEach((status, index) => {
		if (finalStatuses.includes(status)) {
			table.set(status, new Set());
		} else {
			table.set(status, new Set([...flow.slice(index + 1), ...failures]));
		}
	});

	for (const failure of failures) {
		table.set(failure, new Set());
	}
	for (const [failure, targets] of recoveries) {
		table.set(failure, new Set(targets));
	}

	return table;
}

export const CARRIER_STATUS_TRANSITIONS = buildTable<OrderCarrierStatus>(
	[
		OrderCarrierStatus.NoCarrier,
		OrderCarrierStatus.CarrierSelectedOrder,
		OrderCarrierStatus.CarrierPickedUpOrder,
		OrderCarrierStatus.CarrierStartDelivery,
		OrderCarrierStatus.CarrierArrivedToCustomer,
		OrderCarrierStatus.DeliveryCompleted,
	],
	[OrderCarrierStatus.IssuesDuringDelivery],
	[OrderCarrierStatus.DeliveryCompleted],
	[
		// Issue resolved: delivery continues, or the client refuses the order afterwards
		[
			OrderCarrierStatus.IssuesDuringDelivery,
			[
				OrderCarrierStatus.CarrierStartDelivery,
				OrderCarrierStatus.CarrierArrivedToCustomer,
				OrderCarrierStatus.DeliveryCompleted,
				OrderCarrierStatus.ClientRefuseTakingOrder,
			],
		],
		// The client can only refuse the order once the carrier arrived (or after an issue); final status
		[
			OrderCarrierStatus.CarrierArrivedToCustomer,
			[
				OrderCarrierStatus.DeliveryCompleted,
				OrderCarrierStatus.IssuesDuringDelivery,
				OrderCarrierStatus.ClientRefuseTakingOrder,
			],
		],
		[OrderCarrierStatus.ClientRefuseTakingOrder, []],
	]
);

export const WAREHOUSE_STATUS_TRANSITIONS = buildTable<OrderWarehouseStatus>(
	[
		OrderWarehouseStatus.NoStatus,
		OrderWarehouseStatus.ReadyForProcessing,
		OrderWarehouseStatus.WarehouseStartedProcessing,
		OrderWarehouseStatus.AllocationStarted,
		OrderWarehouseStatus.AllocationFinished,
		OrderWarehouseStatus.PackagingStarted,
		OrderWarehouseStatus.PackagingFinished,
		OrderWarehouseStatus.GivenToCarrier,
		OrderWarehouseStatus.GivenToCustomer,
	],
	[
		OrderWarehouseStatus.AllocationFailed,
		OrderWarehouseStatus.PackagingFailed,
	],
	[OrderWarehouseStatus.GivenToCustomer],
	[
		// Retry allocation after a failure
		[
			OrderWarehouseStatus.AllocationFailed,
			[
				OrderWarehouseStatus.WarehouseStartedProcessing,
				OrderWarehouseStatus.AllocationStarted,
			],
		],
		// Retry packaging after a failure
		[
			OrderWarehouseStatus.PackagingFailed,
			[
				OrderWarehouseStatus.AllocationFinished,
				OrderWarehouseStatus.PackagingStarted,
			],
		],
	]
);

function isTransitionAllowed<T extends number>(
	table: TransitionTable<T>,
	from: T,
	to: T
): boolean {
	if (from === to) {
		return true;
	}
	const allowed = table.get(from);
	return allowed != null && allowed.has(to);
}

export function isCarrierStatusTransitionAllowed(
	from: OrderCarrierStatus,
	to: OrderCarrierStatus
): boolean {
	return isTransitionAllowed(CARRIER_STATUS_TRANSITIONS, from, to);
}

export function isWarehouseStatusTransitionAllowed(
	from: OrderWarehouseStatus,
	to: OrderWarehouseStatus
): boolean {
	return isTransitionAllowed(WAREHOUSE_STATUS_TRANSITIONS, from, to);
}

/**
 * Throws a descriptive error if the carrier status cannot move from `from` to `to`
 */
export function assertCarrierStatusTransition(
	from: OrderCarrierStatus,
	to: OrderCarrierStatus
): void {
	if (!CARRIER_STATUS_TRANSITIONS.has(to)) {
		throw new Error(`Unknown carrier status '${to}'!`);
	}
	if (!isCarrierStatusTransitionAllowed(from, to)) {
		throw new Error(
			`Invalid order carrier status transition: '${OrderCarrierStatus[from]}' (${from}) -> '${OrderCarrierStatus[to]}' (${to}) is not allowed!`
		);
	}
}

/**
 * Throws a descriptive error if the warehouse status cannot move from `from` to `to`
 */
export function assertWarehouseStatusTransition(
	from: OrderWarehouseStatus,
	to: OrderWarehouseStatus
): void {
	if (!WAREHOUSE_STATUS_TRANSITIONS.has(to)) {
		throw new Error(`Unknown warehouse status '${to}'!`);
	}
	if (!isWarehouseStatusTransitionAllowed(from, to)) {
		throw new Error(
			`Invalid order warehouse status transition: '${OrderWarehouseStatus[from]}' (${from}) -> '${OrderWarehouseStatus[to]}' (${to}) is not allowed!`
		);
	}
}

/**
 * Throws if the order was already handed over to the customer (delivered by the carrier
 * or given to the customer by the store): such an order can not be cancelled any more,
 * because cancelling would put its products back into store stock.
 * Issue, refusal and failure statuses stay cancellable.
 */
export function assertOrderCanBeCancelled(order: {
	id?: string;
	carrierStatus?: OrderCarrierStatus;
	warehouseStatus?: OrderWarehouseStatus;
}): void {
	if (
		order.carrierStatus === OrderCarrierStatus.DeliveryCompleted ||
		order.warehouseStatus === OrderWarehouseStatus.GivenToCustomer
	) {
		throw new Error(
			`Order ${order.id} was already given to the customer and can not be cancelled!`
		);
	}
}

/**
 * Carrier statuses of an order whose products are already with the carrier or the
 * customer. The carrier app sets them without changing the store status, so an
 * order picked up by its carrier can still be `PackagingFinished` for the store.
 */
const HANDED_OVER_CARRIER_STATUSES: OrderCarrierStatus[] = [
	OrderCarrierStatus.CarrierPickedUpOrder,
	OrderCarrierStatus.CarrierStartDelivery,
	OrderCarrierStatus.CarrierArrivedToCustomer,
	OrderCarrierStatus.DeliveryCompleted,
];

/**
 * Throws if the products of the order can no longer be added, decreased or removed:
 * a cancelled order already put its products back into store stock, and an order
 * handed over to the carrier or to the customer already left the store. Changing
 * the products of such an order would restock (or take) them a second time.
 */
export function assertOrderProductsCanChange(order: {
	id?: string;
	isCancelled?: boolean;
	carrierStatus?: OrderCarrierStatus;
	warehouseStatus?: OrderWarehouseStatus;
}): void {
	if (order.isCancelled) {
		throw new Error(
			`Order ${order.id} is cancelled, so its products can not change!`
		);
	}

	if (
		HANDED_OVER_CARRIER_STATUSES.includes(order.carrierStatus) ||
		order.warehouseStatus === OrderWarehouseStatus.GivenToCarrier ||
		order.warehouseStatus === OrderWarehouseStatus.GivenToCustomer
	) {
		throw new Error(
			`Order ${order.id} was already handed over, so its products can not change!`
		);
	}
}

/**
 * Mongo filter for an order that is not cancelled. Status writes match only
 * such an order, so a cancel that lands after their check makes them match nothing.
 */
export const notCancelledOrderFilter = {
	isCancelled: { $ne: true },
};

/**
 * Mongo filter for an order that can still be cancelled: not cancelled yet and
 * not given to the customer (the rule of `assertOrderCanBeCancelled`). The cancel
 * write matches only such an order, so of two cancels at once only one writes it,
 * and a delivery that lands after the check makes it match nothing.
 */
export const cancellableOrderFilter = {
	...notCancelledOrderFilter,
	carrierStatus: { $ne: OrderCarrierStatus.DeliveryCompleted },
	warehouseStatus: { $ne: OrderWarehouseStatus.GivenToCustomer },
};
