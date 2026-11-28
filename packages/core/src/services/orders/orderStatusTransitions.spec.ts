import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import {
	assertCarrierStatusTransition,
	assertOrderProductsCanChange,
	assertWarehouseStatusTransition,
	isCarrierStatusTransitionAllowed,
	isWarehouseStatusTransitionAllowed,
	productsCanChangeOrderFilter,
} from './orderStatusTransitions';

describe('order carrier status transitions', () => {
	const C = OrderCarrierStatus;

	it.each([
		[C.NoCarrier, C.CarrierSelectedOrder],
		[C.CarrierSelectedOrder, C.CarrierPickedUpOrder],
		[C.CarrierPickedUpOrder, C.CarrierStartDelivery],
		[C.CarrierStartDelivery, C.CarrierArrivedToCustomer],
		[C.CarrierArrivedToCustomer, C.DeliveryCompleted],
		// skipping steps is allowed
		[C.CarrierSelectedOrder, C.CarrierStartDelivery],
		[C.CarrierStartDelivery, C.DeliveryCompleted],
		// failures are reachable from any non-final status
		[C.CarrierSelectedOrder, C.IssuesDuringDelivery],
		[C.CarrierStartDelivery, C.IssuesDuringDelivery],
		[C.CarrierArrivedToCustomer, C.ClientRefuseTakingOrder],
		// recovery from an issue
		[C.IssuesDuringDelivery, C.CarrierStartDelivery],
		[C.IssuesDuringDelivery, C.DeliveryCompleted],
		[C.IssuesDuringDelivery, C.ClientRefuseTakingOrder],
	])('allows %i -> %i', (from, to) => {
		expect(isCarrierStatusTransitionAllowed(from, to)).toBe(true);
		expect(() => assertCarrierStatusTransition(from, to)).not.toThrow();
	});

	it.each([
		// going back
		[C.CarrierStartDelivery, C.CarrierPickedUpOrder],
		[C.CarrierArrivedToCustomer, C.NoCarrier],
		// final statuses cannot change
		[C.DeliveryCompleted, C.CarrierStartDelivery],
		[C.DeliveryCompleted, C.IssuesDuringDelivery],
		[C.ClientRefuseTakingOrder, C.DeliveryCompleted],
		[C.ClientRefuseTakingOrder, C.IssuesDuringDelivery],
		// an issue cannot be "recovered" back before the delivery started
		[C.IssuesDuringDelivery, C.NoCarrier],
		[C.IssuesDuringDelivery, C.CarrierSelectedOrder],
		// the client can only refuse after the carrier arrived or after an issue
		[C.NoCarrier, C.ClientRefuseTakingOrder],
		[C.CarrierSelectedOrder, C.ClientRefuseTakingOrder],
		[C.CarrierPickedUpOrder, C.ClientRefuseTakingOrder],
		[C.CarrierStartDelivery, C.ClientRefuseTakingOrder],
	])('rejects %i -> %i', (from, to) => {
		expect(isCarrierStatusTransitionAllowed(from, to)).toBe(false);
		expect(() => assertCarrierStatusTransition(from, to)).toThrow(
			/Invalid order carrier status transition/
		);
	});

	it('allows re-sending the current status (idempotent retry)', () => {
		for (const status of [
			C.NoCarrier,
			C.CarrierStartDelivery,
			C.DeliveryCompleted,
			C.IssuesDuringDelivery,
			C.ClientRefuseTakingOrder,
		]) {
			expect(isCarrierStatusTransitionAllowed(status, status)).toBe(
				true
			);
		}
	});

	it('rejects unknown target statuses', () => {
		expect(() =>
			assertCarrierStatusTransition(C.NoCarrier, 42 as any)
		).toThrow(/Unknown carrier status/);
		expect(() =>
			assertCarrierStatusTransition(C.NoCarrier, undefined as any)
		).toThrow(/Unknown carrier status/);
	});

	it('names the statuses in the error message', () => {
		expect(() =>
			assertCarrierStatusTransition(
				C.CarrierStartDelivery,
				C.CarrierPickedUpOrder
			)
		).toThrow(/CarrierStartDelivery.*CarrierPickedUpOrder/);
	});
});

describe('order warehouse status transitions', () => {
	const W = OrderWarehouseStatus;

	it.each([
		[W.NoStatus, W.ReadyForProcessing],
		[W.ReadyForProcessing, W.WarehouseStartedProcessing],
		[W.AllocationStarted, W.AllocationFinished],
		[W.PackagingStarted, W.PackagingFinished],
		[W.PackagingFinished, W.GivenToCarrier],
		[W.GivenToCarrier, W.GivenToCustomer],
		// skipping steps is allowed
		[W.ReadyForProcessing, W.PackagingFinished],
		[W.PackagingFinished, W.GivenToCustomer],
		// failures
		[W.AllocationStarted, W.AllocationFailed],
		[W.PackagingStarted, W.PackagingFailed],
		// retry after a failure
		[W.AllocationFailed, W.AllocationStarted],
		[W.PackagingFailed, W.PackagingStarted],
	])('allows %i -> %i', (from, to) => {
		expect(isWarehouseStatusTransitionAllowed(from, to)).toBe(true);
		expect(() => assertWarehouseStatusTransition(from, to)).not.toThrow();
	});

	it.each([
		[W.PackagingFinished, W.AllocationStarted],
		[W.GivenToCarrier, W.ReadyForProcessing],
		[W.ReadyForProcessing, W.NoStatus],
		// final status cannot change
		[W.GivenToCustomer, W.GivenToCarrier],
		[W.GivenToCustomer, W.PackagingFailed],
		// a failure cannot jump straight to the end of the flow
		[W.AllocationFailed, W.GivenToCustomer],
		[W.PackagingFailed, W.GivenToCarrier],
		[W.AllocationFailed, W.ReadyForProcessing],
		// a failure cannot move to the other failure (the other stage never ran)
		[W.AllocationFailed, W.PackagingFailed],
		[W.PackagingFailed, W.AllocationFailed],
	])('rejects %i -> %i', (from, to) => {
		expect(isWarehouseStatusTransitionAllowed(from, to)).toBe(false);
		expect(() => assertWarehouseStatusTransition(from, to)).toThrow(
			/Invalid order warehouse status transition/
		);
	});

	it('allows re-sending the current status (idempotent retry)', () => {
		for (const status of [
			W.NoStatus,
			W.PackagingStarted,
			W.GivenToCustomer,
			W.AllocationFailed,
		]) {
			expect(isWarehouseStatusTransitionAllowed(status, status)).toBe(
				true
			);
		}
	});

	it('rejects unknown target statuses', () => {
		expect(() =>
			assertWarehouseStatusTransition(W.NoStatus, 99 as any)
		).toThrow(/Unknown warehouse status/);
	});
});

describe('assertOrderProductsCanChange', () => {
	const C = OrderCarrierStatus;
	const W = OrderWarehouseStatus;

	it.each([
		[{ isCancelled: true }, /is cancelled/],
		[{ carrierStatus: C.DeliveryCompleted }, /was already handed over/],
		// The carrier app moves the carrier status only: the store status stays PackagingFinished
		[
			{
				carrierStatus: C.CarrierPickedUpOrder,
				warehouseStatus: W.PackagingFinished,
			},
			/was already handed over/,
		],
		[
			{
				carrierStatus: C.CarrierStartDelivery,
				warehouseStatus: W.PackagingFinished,
			},
			/was already handed over/,
		],
		[
			{
				carrierStatus: C.CarrierArrivedToCustomer,
				warehouseStatus: W.PackagingFinished,
			},
			/was already handed over/,
		],
		[{ warehouseStatus: W.GivenToCarrier }, /was already handed over/],
		[{ warehouseStatus: W.GivenToCustomer }, /was already handed over/],
	])('refuses %p', (order, message) => {
		expect(() =>
			assertOrderProductsCanChange({ id: 'o1', ...order })
		).toThrow(message);
	});

	it.each([
		[{ isCancelled: false, warehouseStatus: W.PackagingFinished }],
		[{ carrierStatus: C.NoCarrier, warehouseStatus: W.NoStatus }],
		[
			{
				carrierStatus: C.CarrierSelectedOrder,
				warehouseStatus: W.PackagingFinished,
			},
		],
		[{ carrierStatus: C.IssuesDuringDelivery }],
		[{ warehouseStatus: W.AllocationFailed }],
	])('allows %p', (order) => {
		expect(() =>
			assertOrderProductsCanChange({ id: 'o1', ...order })
		).not.toThrow();
	});
});

describe('productsCanChangeOrderFilter', () => {
	/**
	 * Whether Mongo matches a stored order with the filter. The filter uses
	 * only $ne and $nin, which also match an order that has no such field.
	 */
	function matches(filter: object, order: Record<string, unknown>): boolean {
		return Object.entries(filter).every(([field, condition]) =>
			Object.entries(condition).every(([operator, operand]) => {
				switch (operator) {
					case '$ne':
						return order[field] !== operand;
					case '$nin':
						return !(operand as unknown[]).includes(order[field]);
					default:
						throw new Error(`${operator} is not handled here`);
				}
			})
		);
	}

	const statuses = (e: object) =>
		Object.values(e).filter((v): v is number => typeof v === 'number');

	it('matches exactly the orders assertOrderProductsCanChange lets change', () => {
		const disagreements: unknown[] = [];

		for (const isCancelled of [undefined, false, true]) {
			for (const carrierStatus of [
				undefined,
				...statuses(OrderCarrierStatus),
			]) {
				for (const warehouseStatus of [
					undefined,
					...statuses(OrderWarehouseStatus),
				]) {
					const order = {
						isCancelled,
						carrierStatus,
						warehouseStatus,
					};
					let canChange = true;

					try {
						assertOrderProductsCanChange({ id: 'o1', ...order });
					} catch {
						canChange = false;
					}

					if (
						matches(productsCanChangeOrderFilter, order) !==
						canChange
					) {
						disagreements.push({ ...order, canChange });
					}
				}
			}
		}

		expect(disagreements).toEqual([]);
	});
});
