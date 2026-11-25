/** Order tracking pages (`/order-info`, `/order-info-takeaway`, feature inventory §4.7, §4.8). */
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/AppHeader';
import { OrderCode } from '../components/OrderCode';
import { OrderMap } from '../components/OrderMap';
import { geoToCoords, mapPoints } from '../components/OrderMap.types';
import {
	DeliveryStatusSteps,
	ElapsedTime,
	OrderStatusTexts,
	PaidBanner,
	orderIssues,
	useViewOrderProducts,
} from '../components/OrderTracking';
import { PaymentButtons } from '../components/PaymentButtons';
import { WarehouseLogo } from '../components/ProductBits';
import { TakeawayStoreInfo, TakeawayTitle } from '../components/TakeawayInfo';
import { env } from '../config/env';
import { DeliveryStatus, OrderWarehouseStatus } from '../domain/enums';
import { deliveryStep, isOrderCompleted, orderWarehouse } from '../domain/order';
import { pickTranslation } from '../domain/product';
import type { Carrier, Order } from '../domain/types';
import { useGuard } from '../hooks/useGuard';
import { useLanguage } from '../hooks/useLanguage';
import { useLiveOrder, usePaymentsEnabled } from '../hooks/useOrder';
import { navigateRoot } from '../navigation/actions';
import { completeOrder } from '../services/orders';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { uiActions } from '../store/ui';
import { colors } from '../theme';

/** Opens the issue modal once when the live order reports an issue (`showIssueOrderInfoModal`). */
function useIssueModal(order: Order | null, warehouseOnly = false) {
	const dispatch = useAppDispatch();
	const modalOpen = useAppSelector((state) => state.ui.modal != null);
	const shown = useRef(false);
	useEffect(() => {
		if (!order || shown.current || modalOpen) {
			return;
		}
		const issues = orderIssues(order, false);
		const deliveryIssue = warehouseOnly ? false : issues.deliveryIssue;
		if (deliveryIssue || issues.warehouseIssue) {
			shown.current = true;
			dispatch(
				uiActions.openModal({
					type: 'issue',
					orderId: order.id,
					isPaid: !!order.isPaid,
					deliveryIssue,
					warehouseIssue: issues.warehouseIssue,
				}),
			);
		}
	}, [dispatch, modalOpen, order, warehouseOnly]);
}

function useOrderPage() {
	const store = useAppStore();
	const orderId = useAppSelector((state) => state.session.orderId);
	const warehouseId = useAppSelector((state) => state.session.orderWarehouseId);
	const modalOpen = useAppSelector((state) => state.ui.modal != null);
	const order = useLiveOrder(orderId);
	const paymentsEnabled = usePaymentsEnabled(warehouseId);
	const end = () => {
		completeOrder(store);
		navigateRoot('Products');
	};
	return { order, paymentsEnabled, modalOpen, end, orderId };
}

export function OrderInfoScreen() {
	const allowed = useGuard('OrderInfo');
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { order, paymentsEnabled, modalOpen, end } = useOrderPage();
	const viewProducts = useViewOrderProducts(order);
	useIssueModal(order);

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	const step = deliveryStep(order);
	const completed = isOrderCompleted(order);
	const issues = orderIssues(order, false);
	const carrier = order?.carrier && typeof order.carrier === 'object' ? (order.carrier as Carrier) : null;
	const points =
		step === DeliveryStatus.Carrier
			? mapPoints([
					['carrier', geoToCoords(carrier?.geoLocation)],
					['customer', geoToCoords(order?.user?.geoLocation)],
				])
			: mapPoints([
					['customer', geoToCoords(order?.user?.geoLocation)],
					['store', geoToCoords(orderWarehouse(order)?.geoLocation)],
				]);

	return (
		<View style={styles.screen} testID='order-info-screen'>
			<AppHeader title={t('ORDER_INFO')} onBack={() => navigateRoot('Products')} />
			<ScrollView contentContainerStyle={[styles.content, modalOpen && styles.blurred]}>
				<View style={styles.box}>
					<OrderStatusTexts order={order} onViewProducts={viewProducts} />
				</View>
				<OrderMap points={points} route={step === DeliveryStatus.Carrier} />
				<View style={styles.boxLight}>
					<ElapsedTime frozen={step === DeliveryStatus.Completed} />
					<DeliveryStatusSteps order={order} />
					{!completed && (
						<View style={styles.buttons}>
							<Button
								mode='outlined'
								onPress={() => dispatch(uiActions.openModal({ type: 'cancel' }))}
								style={{ flex: paymentsEnabled ? 1 : 4 }}
								testID='undo-button'>
								{t('BUY_POPUP.BUTTONS.UNDO')}
							</Button>
							{paymentsEnabled && order && (
								<View style={styles.payment}>
									<PaymentButtons order={order} />
								</View>
							)}
						</View>
					)}
					{completed && !issues.any && (
						<Button mode='contained' onPress={end} testID='end-order-button'>
							{order?.isCancelled ? t('OK') : t('BUY_POPUP.BUTTONS.END')}
						</Button>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

export function OrderTakeawayInfoScreen() {
	const allowed = useGuard('OrderTakeawayInfo');
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const language = useLanguage();
	const inStoreMode = useAppSelector((state) => !!state.session.inStore);
	const { order, paymentsEnabled, modalOpen, end } = useOrderPage();
	const viewProducts = useViewOrderProducts(order);
	const [productsStep, setProductsStep] = useState(false);
	useIssueModal(order);

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	const showPayment = paymentsEnabled && !!order && !order.isPaid;
	const completed = isOrderCompleted(order);
	const warehouse = orderWarehouse(order);
	const ready = (order?.warehouseStatus ?? 0) >= OrderWarehouseStatus.PackagingFinished;
	const undo = () => dispatch(uiActions.openModal({ type: 'cancel' }));

	return (
		<View style={styles.screen} testID='order-takeaway-info-screen'>
			<AppHeader title={t('ORDER_INFO')} onBack={() => navigateRoot('Products')} />
			<ScrollView contentContainerStyle={[styles.content, modalOpen && styles.blurred]}>
				<PaidBanner order={order} />
				{order && !productsStep && (
					<View testID='takeaway-store-step'>
						<View style={styles.box}>
							<TakeawayTitle order={order} onViewProducts={viewProducts} />
						</View>
						<View>
							{!inStoreMode && (
								<OrderMap
									points={mapPoints([
										['customer', geoToCoords(order.user?.geoLocation)],
										['store', geoToCoords(warehouse?.geoLocation)],
									])}
									route
								/>
							)}
							<View style={styles.storeLogo}>
								<WarehouseLogo logo={warehouse?.logo} size={64} />
							</View>
						</View>
						<View style={styles.boxLight}>
							<ElapsedTime />
							<TakeawayStoreInfo order={order} />
							{!completed && (
								<View style={styles.buttons}>
									<Button mode='outlined' onPress={undo} testID='undo-button'>
										{t('BUY_POPUP.BUTTONS.UNDO')}
									</Button>
									<Button
										mode='contained'
										buttonColor={colors.balanced}
										onPress={() => (inStoreMode ? end() : setProductsStep(true))}
										testID={inStoreMode ? 'got-it-button' : 'im-here-button'}>
										{inStoreMode ? t('BUY_POPUP.BUTTONS.GOT_IT') : t('BUY_POPUP.BUTTONS.IM_HERE')}
									</Button>
									{showPayment && <PaymentButtons order={order} small />}
								</View>
							)}
							{completed && (
								<Button mode='contained' onPress={end} testID='end-order-button'>
									{t('BUY_POPUP.BUTTONS.END')}
								</Button>
							)}
						</View>
					</View>
				)}
				{order && productsStep && (
					<View testID='takeaway-products-step'>
						<View style={styles.box}>
							<Image
								source={{ uri: pickTranslation(order.products[0]?.product?.images, language, env.DEFAULT_LANGUAGE) }}
								style={styles.productImage}
								resizeMode='contain'
							/>
						</View>
						<View style={styles.boxLight}>
							<OrderCode order={order} />
							<View style={styles.buttons}>
								<Button mode='outlined' onPress={undo} testID='undo-button'>
									{t('BUY_POPUP.BUTTONS.CANCEL')}
								</Button>
								{ready && (
									<Button mode='contained' buttonColor={colors.balanced} onPress={end} testID='got-it-button'>
										{t('BUY_POPUP.BUTTONS.GOT_IT')}
									</Button>
								)}
								{showPayment && <PaymentButtons order={order} small />}
							</View>
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.dark },
	content: { paddingBottom: 24 },
	blurred: { opacity: 0.35 },
	box: { backgroundColor: colors.secondary, padding: 12 },
	boxLight: { backgroundColor: colors.primaryLight, padding: 12, gap: 8 },
	buttons: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
	payment: { flex: 3 },
	storeLogo: { alignItems: 'center', marginTop: -32 },
	productImage: { width: '100%', height: 240 },
});
