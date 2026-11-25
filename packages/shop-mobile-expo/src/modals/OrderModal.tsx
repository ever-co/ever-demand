/** Delivery order popup (`OrderPage` modal, feature inventory §4.7, popup mode). */
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PaymentButtons } from '../components/PaymentButtons';
import {
	DeliveryStatusSteps,
	ElapsedTime,
	IssueTexts,
	OrderStatusTexts,
	orderIssues,
	useViewOrderProducts,
} from '../components/OrderTracking';
import { DeliveryStatus } from '../domain/enums';
import { deliveryStep, isOrderCompleted } from '../domain/order';
import { useLiveOrder, usePaymentsEnabled } from '../hooks/useOrder';
import { useServices } from '../services/container';
import { cancelOpenOrder, completeOrder } from '../services/orders';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { ButtonRow, ModalFrame } from './ModalFrame';

export function OrderModal() {
	const { t } = useTranslation();
	const { routers } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const orderId = useAppSelector((state) => state.session.orderId);
	const warehouseId = useAppSelector((state) => state.session.orderWarehouseId);
	const order = useLiveOrder(orderId);
	const paymentsEnabled = usePaymentsEnabled(warehouseId);
	const viewProducts = useViewOrderProducts(order);

	const issues = orderIssues(order, false);
	const completed = isOrderCompleted(order);
	const close = () => dispatch(uiActions.closeModal());

	const closePopup = async () => {
		try {
			if (issues.any) {
				await cancelOpenOrder({ routers, store });
			}
		} catch (error) {
			console.warn('Could not cancel the order', error);
		}
		completeOrder(store);
		close();
	};

	return (
		<ModalFrame testID='order-modal' onClose={issues.any ? undefined : close} onDismiss={close}>
			{!issues.any && (
				<>
					<OrderStatusTexts order={order} onViewProducts={viewProducts} />
					<ElapsedTime frozen={deliveryStep(order) === DeliveryStatus.Completed} />
					<DeliveryStatusSteps order={order} />
				</>
			)}
			<IssueTexts deliveryIssue={issues.deliveryIssue} warehouseIssue={issues.warehouseIssue} />
			{!completed && !issues.any && (
				<ButtonRow>
					<Button
						mode='outlined'
						onPress={() => dispatch(uiActions.openModal({ type: 'cancel' }))}
						style={{ flex: paymentsEnabled ? 1 : 3 }}
						testID='undo-button'>
						{t('BUY_POPUP.BUTTONS.UNDO')}
					</Button>
					{paymentsEnabled && order && <PaymentButtons order={order} />}
				</ButtonRow>
			)}
			{(issues.any || completed) && (
				<Button mode='contained' onPress={() => void closePopup()} testID='end-order-button'>
					{issues.any || order?.isCancelled ? t('OK') : t('BUY_POPUP.BUTTONS.END')}
				</Button>
			)}
		</ModalFrame>
	);
}
