import { useCallback } from 'react';
import type { Invite } from '../domain/types';
import { navigate, navigateRoot } from '../navigation/actions';
import { useServices } from '../services/container';
import { useAppStore } from '../store';
import { sessionActions } from '../store/session';

/**
 * `register(invite)` of both invite pages: create the customer at the invite's address, then go
 * back to the product details that sent the visitor here, or to the products.
 */
export function useRegister() {
	const { routers } = useServices();
	const store = useAppStore();

	return useCallback(
		async (invite: Invite): Promise<string> => {
			const user = await routers.userAuth.register({
				user: { apartment: invite.apartment, geoLocation: invite.geoLocation },
			});
			store.dispatch(sessionActions.setUserId(user.id));

			const { backToDetails, warehouseId } = store.getState().session;
			if (backToDetails) {
				store.dispatch(sessionActions.clearBackToDetails());
				navigateRoot('Products');
				navigate('ProductDetails', { id: backToDetails, warehouseId: warehouseId ?? '', backUrl: '/products' });
			} else {
				navigateRoot('Products');
			}
			return user.id;
		},
		[routers, store],
	);
}
