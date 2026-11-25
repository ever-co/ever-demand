import { useCallback } from 'react';
import { DeliveryType } from '../domain/enums';
import { navigateRoot } from '../navigation/actions';
import { inviteEntry } from '../navigation/guards';
import { useServices } from '../services/container';
import { buy, type BuyRequest, type BuyResult } from '../services/orders';
import { useAppDispatch, useAppStore } from '../store';
import { uiActions } from '../store/ui';

/** Buy and "show the order info" (feature inventory §4.5 step 3). */
export function useOrderFlow() {
	const services = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();

	const showOrderInfo = useCallback(async () => {
		const { orderId, deliveryType } = store.getState().session;
		if (!orderId) {
			return;
		}

		if (services.env.SHOPPING_CART) {
			try {
				if (await services.graphql.getOrderWaitForCompletion(orderId)) {
					dispatch(uiActions.openModal({ type: 'orderProducts', orderId, confirmable: true }));
					return;
				}
			} catch (error) {
				console.warn('Could not load the order', error);
			}
		}

		const isDelivery = deliveryType === DeliveryType.Delivery;
		if (services.env.ORDER_INFO_TYPE === 'popup') {
			dispatch(uiActions.openModal({ type: isDelivery ? 'order' : 'takeaway' }));
		} else {
			navigateRoot(isDelivery ? 'OrderInfo' : 'OrderTakeawayInfo');
		}
	}, [dispatch, services, store]);

	const buyAndShow = useCallback(
		async (request: BuyRequest): Promise<BuyResult> => {
			const result = await buy(
				{
					routers: services.routers,
					graphql: services.graphql,
					store,
					shoppingCart: services.env.SHOPPING_CART,
				},
				request,
			);
			if (result === 'invite') {
				navigateRoot(inviteEntry(store.getState().session));
			} else if (result === 'ordered') {
				await showOrderInfo();
			}
			return result;
		},
		[services, showOrderInfo, store],
	);

	return { showOrderInfo, buyAndShow };
}
