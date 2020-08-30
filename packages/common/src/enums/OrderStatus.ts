/**
 * Status of Order
 * (used usually as combined value from Carrier status and Warehouse status)
 *
 * @enum {number}
 */
enum OrderStatus {
	WarehousePreparation = 0,
	InDelivery = 1,
	Delivered = 2,
	CanceledWhileWarehousePreparation = 200,
	CanceledWhileInDelivery = 201,
	WarehouseIssue = 202,
	CarrierIssue = 203,
}

export default OrderStatus;
