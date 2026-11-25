/** Buy, cancel and issue flows (feature inventory §4.5, §4.10, §4.11). */
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import { orderWarehouseId } from '../domain/order';
import type { Order } from '../domain/types';
import type { GraphQLApi } from '../graphql/api';
import type { OrderCreateInput, Routers } from '../rpc/routers';
import type { AppStore } from '../store';
import { sessionActions } from '../store/session';
import { uiActions } from '../store/ui';

export interface BuyRequest {
	/** `product.id` sent to `warehouse-orders.create`. */
	productId: string;
	warehouseId: string;
	/** What to resume after a forced invite: the warehouse product id (feed) or product id (details). */
	resumeId: string;
	/** Product details also returns to the details page after the invite. */
	fromDetails?: boolean;
}

export type BuyResult = 'invite' | 'ordered' | 'failed';

export interface OrderDeps {
	routers: Routers;
	graphql: GraphQLApi;
	store: AppStore;
	shoppingCart: boolean;
}

/**
 * Creates the order (or adds to the open one from the feed). In "browse first" mode
 * (registration disabled, no user) it remembers the product and returns `invite`.
 */
export async function buy(deps: OrderDeps, request: BuyRequest): Promise<BuyResult> {
	const session = deps.store.getState().session;

	if (!session.userId && session.registrationSystem === RegistrationSystem.Disabled) {
		deps.store.dispatch(
			sessionActions.setPendingBuy({
				buyProduct: request.resumeId,
				warehouseId: request.warehouseId,
				backToDetails: request.fromDetails ? request.productId : undefined,
			}),
		);
		return 'invite';
	}

	if (!session.userId) {
		return 'invite';
	}

	const input: OrderCreateInput = {
		warehouseId: request.warehouseId || session.warehouseId || '',
		products: [{ count: 1, productId: request.productId }],
		userId: session.userId,
		orderType: session.deliveryType,
		options: { autoConfirm: true },
	};
	if (!request.fromDetails) {
		input.waitForCompletion = deps.shoppingCart;
	}

	try {
		if (!session.orderId || request.fromDetails) {
			const order = await deps.routers.warehouseOrders.create(input);
			deps.store.dispatch(
				sessionActions.setOrder({
					orderId: order.id,
					warehouseId: orderWarehouseId(order) ?? input.warehouseId,
				}),
			);
		} else {
			await deps.routers.warehouseOrders.addMore(
				input.warehouseId,
				input.userId,
				session.orderId,
				input.products,
			);
		}
		deps.store.dispatch(uiActions.bumpOrderRevision());
		return 'ordered';
	} catch (error) {
		console.warn('Could not buy the product', error);
		return 'failed';
	}
}

/**
 * Open order still in progress? The feed asks `GetOrder {status}`; a delivered or failed order is
 * forgotten (`startDate`, `endTime`, `_orderId`).
 */
export async function openOrderWarehouse(deps: OrderDeps): Promise<string | null> {
	const { orderId, orderWarehouseId: warehouseId } = deps.store.getState().session;
	if (!orderId || !warehouseId) {
		return null;
	}
	try {
		const status = await deps.graphql.getOrderStatus(orderId);
		if (status != null && status < 2) {
			return warehouseId;
		}
	} catch (error) {
		console.warn('Could not load the order status', error);
		return warehouseId;
	}
	deps.store.dispatch(sessionActions.clearOrder());
	return null;
}

/** Undo / cancel: `warehouse-orders.cancel`, then a refund when the order was paid. */
export async function cancelOpenOrder(deps: Pick<OrderDeps, 'routers' | 'store'>): Promise<Order | null> {
	const { orderId } = deps.store.getState().session;
	if (!orderId) {
		return null;
	}
	const order = await deps.routers.warehouseOrders.cancel(orderId);
	deps.store.dispatch(sessionActions.clearOrder());
	if (order?.isPaid) {
		await deps.routers.order.refundWithStripe(order.id);
	}
	return order;
}

/** Issue modal OK: cancel this order, refund when `wasPaid`, forget it. */
export async function closeIssue(
	deps: Pick<OrderDeps, 'routers' | 'store'>,
	orderId: string,
	wasPaid: boolean,
): Promise<void> {
	await deps.routers.warehouseOrders.cancel(orderId);
	if (wasPaid) {
		await deps.routers.order.refundWithStripe(orderId);
	}
	deps.store.dispatch(sessionActions.clearOrder());
}

/** End / Got it: forget the finished order. */
export function completeOrder(store: AppStore): void {
	store.dispatch(sessionActions.clearOrder());
}

export function isDelivery(store: AppStore): boolean {
	return store.getState().session.deliveryType === DeliveryType.Delivery;
}
