/**
 * Order info modal (`OrderInfoModalComponent`): the full order card with Confirm / Add more.
 * In the shopping-cart flow every button (Close too, like the Ionic `dismiss(true)`) confirms the
 * cart with `warehouse-orders.userComplete` and shows the order info again.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { OrderCard } from '../components/OrderCard';
import type { Order } from '../domain/types';
import { useObservable } from '../hooks/useObservable';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { useServices } from '../services/container';
import { useAppDispatch } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';
import { ButtonRow, ModalFrame } from './ModalFrame';

export function OrderProductsModal({ orderId, confirmable }: { orderId: string; confirmable: boolean }) {
	const { t } = useTranslation();
	const { routers } = useServices();
	const dispatch = useAppDispatch();
	const { showOrderInfo } = useOrderFlow();
	const order = useObservable<Order>(() => routers.order.get(orderId, { populateWarehouse: true }), [orderId]).value;

	const dismiss = async () => {
		dispatch(uiActions.closeModal());
		if (confirmable) {
			try {
				await routers.warehouseOrders.userComplete(orderId);
			} catch (error) {
				console.warn('Could not confirm the order', error);
			}
			await showOrderInfo();
		}
	};

	return (
		<ModalFrame testID='order-products-modal' onClose={() => void dismiss()}>
			<Text style={styles.title}>{t('EXPO.ORDER_INFO_MODAL.TITLE')}</Text>
			{order ? <OrderCard order={order} showAll /> : <ActivityIndicator color={colors.light} />}
			<ButtonRow>
				<Button mode='contained' onPress={() => void dismiss()} style={styles.flex} testID='order-products-confirm'>
					{t('EXPO.ORDER_INFO_MODAL.CONFIRM')}
				</Button>
				<Button
					mode='contained'
					buttonColor={colors.success}
					onPress={() => void dismiss()}
					style={styles.flex}
					testID='order-products-add-more'>
					{t('EXPO.ORDER_INFO_MODAL.ADD_MORE')}
				</Button>
			</ButtonRow>
		</ModalFrame>
	);
}


const styles = StyleSheet.create({
	title: { color: colors.light, fontSize: 18, fontWeight: 'bold' },
	flex: { flex: 1 },
});
