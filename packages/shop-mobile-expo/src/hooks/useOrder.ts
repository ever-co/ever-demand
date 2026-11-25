import { useServices } from '../services/container';
import type { Order, Warehouse } from '../domain/types';
import { useObservable } from './useObservable';

/** Live order with its warehouse and carrier (`order.get(_orderId, { populate... })`). */
export function useLiveOrder(orderId: string | null): Order | null {
	const { routers } = useServices();
	const { value } = useObservable<Order>(
		() => (orderId ? routers.order.get(orderId, { populateWarehouse: true, populateCarrier: true }) : null),
		[orderId],
	);
	return value ?? null;
}

/** Payments are shown only when the order's warehouse has them on (`isPaymentEnabled`). */
export function usePaymentsEnabled(warehouseId: string | null): boolean {
	const { routers } = useServices();
	const { value } = useObservable<Warehouse>(
		() => (warehouseId ? routers.warehouse.get(warehouseId, true) : null),
		[warehouseId],
	);
	return value ? !!value.isPaymentEnabled : true;
}
