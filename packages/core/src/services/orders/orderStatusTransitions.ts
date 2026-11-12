import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

/**
 * Allowed order status transitions.
 *
 * Rules (for both carrier and warehouse statuses):
 *  - Setting the status an order already has is always allowed (idempotent retries from mobile apps).
 *  - The regular flow only moves forward (steps may be skipped, never reverted).
 *  - A failure/issue status can be reached from any non-final status.
 *  - A failure status can only be recovered to the stages that retry the failed work.
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
	[
		OrderCarrierStatus.IssuesDuringDelivery,
		OrderCarrierStatus.ClientRefuseTakingOrder,
	],
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
				OrderWarehouseStatus.PackagingFailed,
			],
		],
		// Retry packaging after a failure
		[
			OrderWarehouseStatus.PackagingFailed,
			[
				OrderWarehouseStatus.AllocationFinished,
				OrderWarehouseStatus.PackagingStarted,
				OrderWarehouseStatus.AllocationFailed,
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
