/** Takeaway order popup (`OrderTakeawayInfoPopup`, feature inventory §4.8, popup mode). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { geoToCoords } from '../components/OrderMap.types';
import { OrderCode } from '../components/OrderCode';
import { ElapsedTime, IssueTexts, PaidBanner, orderIssues, useViewOrderProducts } from '../components/OrderTracking';
import { PaymentButtons } from '../components/PaymentButtons';
import { TakeawayStoreInfo, TakeawayTitle } from '../components/TakeawayInfo';
import { env } from '../config/env';
import { isOrderCompleted, orderWarehouse } from '../domain/order';
import { pickTranslation } from '../domain/product';
import { useLanguage } from '../hooks/useLanguage';
import { useLiveOrder, usePaymentsEnabled } from '../hooks/useOrder';
import { useServices } from '../services/container';
import { cancelOpenOrder, completeOrder } from '../services/orders';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';
import { ButtonRow, ModalFrame } from './ModalFrame';

export function TakeawayModal() {
	const { t } = useTranslation();
	const { routers } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const language = useLanguage();
	const orderId = useAppSelector((state) => state.session.orderId);
	const warehouseId = useAppSelector((state) => state.session.orderWarehouseId);
	const inStoreMode = useAppSelector((state) => !!state.session.inStore);
	const order = useLiveOrder(orderId);
	const paymentsEnabled = usePaymentsEnabled(warehouseId);
	const viewProducts = useViewOrderProducts(order);
	const [inStore, setInStore] = useState(false);
	const [showProducts, setShowProducts] = useState(true);

	// The takeaway popup only knows warehouse issues.
	const issues = orderIssues(order, false);
	const areIssues = issues.warehouseIssue;
	const close = () => dispatch(uiActions.closeModal());

	const closePopup = async () => {
		try {
			if (areIssues) {
				await cancelOpenOrder({ routers, store });
			}
		} catch (error) {
			console.warn('Could not cancel the order', error);
		}
		completeOrder(store);
		close();
	};

	const openMap = () => {
		if (!order) {
			return;
		}
		dispatch(
			uiActions.openModal({
				type: 'map',
				origin: geoToCoords(order.user?.geoLocation),
				destination: geoToCoords(orderWarehouse(order)?.geoLocation),
			}),
		);
	};

	const showPayment = paymentsEnabled && !!order && !order.isPaid;

	return (
		<ModalFrame testID='takeaway-modal' onClose={areIssues ? undefined : close} onDismiss={close}>
			{!areIssues && (
				<>
					<PaidBanner order={order} />
					<TakeawayTitle order={order} onViewProducts={viewProducts} />
					{!inStore ? (
						<View>
							<ElapsedTime />
							<TakeawayStoreInfo order={order} lessInfo onOpenMap={openMap} />
						</View>
					) : (
						<View style={styles.inStore}>
							{!!orderWarehouse(order)?.contactPhone && (
								<Pressable
									onPress={() => setShowProducts((v) => !v)}
									style={styles.toggle}
									testID='toggle-qr-products'>
									<MaterialCommunityIcons
										name={showProducts ? 'qrcode' : 'basket'}
										size={18}
										color={colors.light}
									/>
									<Text style={styles.toggleText}>
										{showProducts ? t('BUY_POPUP.BUTTONS.SHOW_QR_CODE') : t('BUY_POPUP.BUTTONS.SHOW_PRODUCTS')}
									</Text>
								</Pressable>
							)}
							{order && !showProducts && <OrderCode order={order} lessInfo />}
							{order && showProducts && (
								<Image
									source={{
										uri: pickTranslation(order.products[0]?.product?.images, language, env.DEFAULT_LANGUAGE),
									}}
									style={styles.productImage}
									resizeMode='contain'
									testID='takeaway-product-image'
								/>
							)}
						</View>
					)}
				</>
			)}
			<IssueTexts deliveryIssue={false} warehouseIssue={areIssues} />
			{!isOrderCompleted(order) && !areIssues && (
				<ButtonRow>
					<Button mode='outlined' onPress={() => dispatch(uiActions.openModal({ type: 'cancel' }))} testID='undo-button'>
						{inStore ? t('BUY_POPUP.BUTTONS.CANCEL') : t('BUY_POPUP.BUTTONS.UNDO')}
					</Button>
					{!inStore && !inStoreMode ? (
						<Button mode='contained' buttonColor={colors.balanced} onPress={() => setInStore(true)} testID='im-here-button'>
							{t('BUY_POPUP.BUTTONS.IM_HERE')}
						</Button>
					) : (
						<Button mode='contained' buttonColor={colors.balanced} onPress={() => void closePopup()} testID='got-it-button'>
							{t('BUY_POPUP.BUTTONS.GOT_IT')}
						</Button>
					)}
					{showPayment && order && <PaymentButtons order={order} small />}
				</ButtonRow>
			)}
			{areIssues && (
				<Button mode='contained' onPress={() => void closePopup()} testID='issue-ok-button'>
					{t('OK')}
				</Button>
			)}
		</ModalFrame>
	);
}

const styles = StyleSheet.create({
	inStore: { alignItems: 'center', gap: 6 },
	toggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	toggleText: { color: colors.light },
	productImage: { width: '100%', height: 220 },
});
