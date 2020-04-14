/**
 * Warehouse Statuses
 *
 * @enum {number}
 */
enum OrderWarehouseStatus {
	/**
	 * No Status (order just created)
	 */
	NoStatus = 0,

	/**
	 * Order just received from client (OperationMode.Warehouse)
	 * or initialized by warehouse (OperationMode.Order) and confirmed ("ready" for warehouse processing)
	 * This field is useful to indicate that Warehouse Confirms an order
	 * (e.g. to let client/customer know that Warehouse will ship/sell product)
	 *
	 * Note: some warehouses want to automatically confirm all orders,
	 * but some want first to review them and confirm each one manually, one by one
	 */
	ReadyForProcessing = 1,

	// Warehouse start work on the order
	// E.g. take order to himself for OperationMode.Warehouse or just start working on order for OperationMode.Order
	WarehouseStartedProcessing = 2,

	// Products allocation started (warehouse)
	AllocationStarted = 3,

	// Warehouse finish allocation of products for packaging
	// (warehouse change order to this status)
	AllocationFinished = 4,

	// Products packaging started (warehouse)
	PackagingStarted = 5,

	// Products are packed for shipping by warehouse
	// Warehouse change order to this status and carriers see packaged orders in warehouses
	// and move to closest warehouse to pick order
	PackagingFinished = 6,

	// Order is given to some carrier for delivery
	GivenToCarrier = 7,

	// Order is given to customer
	GivenToCustomer = 8,

	// Fail to allocate products
	// (some products are missing in stock/warehouse)
	AllocationFailed = 200,

	// Fail to pack products
	// (something was wrong during packaging or maybe pack broken etc)
	PackagingFailed = 201,
}

// TODO: this should be translated
export function warehouseStatusToString(status: OrderWarehouseStatus): string {
	switch (status) {
		case OrderWarehouseStatus.NoStatus:
			return 'Created';

		case OrderWarehouseStatus.ReadyForProcessing:
			return 'Confirmed';

		case OrderWarehouseStatus.WarehouseStartedProcessing:
			return 'Processing';

		case OrderWarehouseStatus.AllocationStarted:
			return 'Allocation Started';

		case OrderWarehouseStatus.AllocationFinished:
			return 'Allocation Finished';

		case OrderWarehouseStatus.PackagingStarted:
			return 'Packaging Started';

		case OrderWarehouseStatus.PackagingFinished:
			return 'Packaged';

		case OrderWarehouseStatus.GivenToCarrier:
			return 'Given to Carrier';

		case OrderWarehouseStatus.GivenToCustomer:
			return 'Given to Customer';

		case OrderWarehouseStatus.AllocationFailed:
			return 'Allocation Failed';

		case OrderWarehouseStatus.PackagingFailed:
			return 'Packaging Failed';

		default:
			return 'BAD_STATUS';
	}
}

export default OrderWarehouseStatus;
