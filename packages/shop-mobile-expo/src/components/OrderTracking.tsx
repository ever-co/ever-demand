/** Order tracking widgets shared by the delivery and takeaway modals and pages. */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DeliveryStatus } from '../domain/enums';
import {
	deliveryStep,
	deliveryTimeRange,
	hasDeliveryIssue,
	hasWarehouseIssue,
	orderTotalPrice,
	statusKeyPrefix,
} from '../domain/order';
import type { Order } from '../domain/types';
import { isRtl } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { useAppDispatch, useAppSelector } from '../store';
import { sessionActions } from '../store/session';
import { uiActions } from '../store/ui';
import { colors } from '../theme';

/** `mm : ss` (or `h : mm : ss`) since `start`. */
export function formatElapsed(start: Date, now: Date): string {
	let diff = Math.max(0, (now.getTime() - start.getTime()) / 1000);
	const hours = Math.floor(diff / 3600);
	diff -= hours * 3600;
	const minutes = Math.floor(diff / 60);
	const seconds = Math.round(diff - minutes * 60);
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	return `${hours < 1 ? '' : `${hours} : `}${pad(minutes)} : ${pad(seconds)}`;
}

/**
 * Elapsed time since the order tracking first opened (`startDate`). `frozen` stops it and stores the
 * value in `endTime` (when the customer step ends).
 */
export function ElapsedTime({ frozen = false }: { frozen?: boolean }) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const startDate = useAppSelector((state) => state.session.startOrderDate);
	const endTime = useAppSelector((state) => state.session.endOrderTime);
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		if (!startDate) {
			dispatch(sessionActions.startOrderTimer(new Date().toISOString()));
		}
	}, [dispatch, startDate]);

	useEffect(() => {
		if (endTime || frozen) {
			return undefined;
		}
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, [endTime, frozen]);

	const value = endTime ?? (startDate ? formatElapsed(new Date(startDate), now) : '00 : 00');

	useEffect(() => {
		if (frozen && !endTime && startDate) {
			dispatch(sessionActions.setEndOrderTime(formatElapsed(new Date(startDate), new Date())));
		}
	}, [dispatch, endTime, frozen, startDate]);

	return (
		<View style={styles.center} testID='elapsed-time'>
			<Text style={styles.mainTitle}>{t('BUY_POPUP.ELAPSED_TIME.TITLE')}</Text>
			<Text style={styles.small} testID='elapsed-time-value'>
				{value}
			</Text>
		</View>
	);
}

/** We / Carrier / You steps. */
export function DeliveryStatusSteps({ order }: { order: Order | null }) {
	const { t } = useTranslation();
	const language = useLanguage();
	const step = deliveryStep(order);
	const steps: Array<{ key: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; at: DeliveryStatus }> = [
		{ key: 'WE', icon: 'office-building', at: DeliveryStatus.Warehouse },
		{ key: 'CARRIER', icon: 'moped', at: DeliveryStatus.Carrier },
		{ key: 'YOU', icon: 'home', at: DeliveryStatus.Customer },
	];
	return (
		<View style={[styles.steps, isRtl(language) && styles.rtl]} testID='delivery-status'>
			{steps.map((s, index) => {
				const active = step >= s.at;
				const current = step === s.at && !(s.at === DeliveryStatus.Warehouse && order?.isCancelled);
				return (
					<React.Fragment key={s.key}>
						{index > 0 && <Text style={[styles.dots, active && styles.active]}>..</Text>}
						<View style={styles.step} testID={`delivery-step-${s.key.toLowerCase()}`}>
							<Text style={[styles.stepLabel, active && styles.active, current && styles.current]}>
								{t(`BUY_POPUP.DELIVERY_STATUS.${s.key}`)}
							</Text>
							<MaterialCommunityIcons
								name={s.icon}
								size={26}
								color={current ? colors.secondary : active ? colors.light : colors.medium}
								style={s.key === 'CARRIER' && isRtl(language) ? styles.flip : undefined}
							/>
						</View>
					</React.Fragment>
				);
			})}
		</View>
	);
}

/** Status title, details (`%t` delivery time) and the not-paid note (`%s` total). */
export function OrderStatusTexts({
	order,
	keyPrefix,
	onViewProducts,
}: {
	order: Order | null;
	keyPrefix?: string;
	onViewProducts?: () => void;
}) {
	const { t } = useTranslation();
	const prefix = keyPrefix ?? statusKeyPrefix(order);
	const total = order ? `${orderTotalPrice(order).toFixed(2)}$` : '00.00$';
	return (
		<View style={styles.center} testID='order-status-texts'>
			<Text style={styles.mainTitle} testID='order-status-title'>
				{t(`${prefix}.TITLE`, { defaultValue: '' })}
			</Text>
			<Text style={styles.small}>
				{t(`${prefix}.DETAILS`, { defaultValue: '' }).replace('%t', deliveryTimeRange(order))}
			</Text>
			{!order?.isPaid && (
				<Text style={styles.small} testID='order-not-paid-note'>
					{t(`${prefix}.NOT_PAID_NOTE`, { defaultValue: '' }).replace('%s', total)}
				</Text>
			)}
			{onViewProducts && (
				<Pressable onPress={onViewProducts} style={styles.viewProducts} testID='view-order-products'>
					<MaterialCommunityIcons name='basket' size={16} color={colors.light} />
					<Text style={styles.link}>{t('BUY_POPUP.VIEW_ORDER_PRODUCTS')}</Text>
				</Pressable>
			)}
		</View>
	);
}

/** Delivery / processing issue boxes. */
export function IssueTexts({ deliveryIssue, warehouseIssue }: { deliveryIssue: boolean; warehouseIssue: boolean }) {
	const { t } = useTranslation();
	return (
		<View testID='order-issue'>
			{deliveryIssue && (
				<View style={styles.box}>
					<Text style={styles.mainTitle}>{t('BUY_POPUP.DELIVERY_WRONG.DELIVERY_WRONG')}</Text>
					<Text style={styles.small}>
						{t('BUY_POPUP.DELIVERY_WRONG.TRY_AGAIN')} ({t('BUY_POPUP.DELIVERY_WRONG.CALL_FOR_DETAILS')})
					</Text>
				</View>
			)}
			{warehouseIssue && (
				<View style={styles.box}>
					<Text style={styles.mainTitle}>{t('BUY_POPUP.DELIVERY_WRONG.PROCESSING_WRONG')}</Text>
					<Text style={styles.small}>{t('BUY_POPUP.DELIVERY_WRONG.TRY_AGAIN')}</Text>
				</View>
			)}
		</View>
	);
}

export function PaidBanner({ order }: { order: Order | null }) {
	const { t } = useTranslation();
	if (!order?.isPaid) {
		return null;
	}
	return (
		<View style={styles.paid} testID='order-paid-banner'>
			<Text style={styles.paidText}>{`${t('BUY_POPUP.ORDER_PAID')}${orderTotalPrice(order)}!`}</Text>
		</View>
	);
}

/** Opens the order products modal for `order` (the "View order products" link). */
export function useViewOrderProducts(order: Order | null) {
	const dispatch = useAppDispatch();
	return () => {
		if (order) {
			dispatch(uiActions.openModal({ type: 'orderProducts', orderId: order.id, confirmable: false }));
		}
	};
}

export function orderIssues(order: Order | null, whenMissing: boolean) {
	const deliveryIssue = hasDeliveryIssue(order, whenMissing);
	const warehouseIssue = hasWarehouseIssue(order, whenMissing);
	return { deliveryIssue, warehouseIssue, any: deliveryIssue || warehouseIssue };
}

const styles = StyleSheet.create({
	center: { alignItems: 'center', paddingVertical: 6 },
	mainTitle: { color: colors.light, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
	small: { color: colors.light, fontSize: 13, textAlign: 'center' },
	steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
	rtl: { flexDirection: 'row-reverse' },
	step: { alignItems: 'center', paddingHorizontal: 10 },
	stepLabel: { color: colors.medium, fontSize: 13 },
	active: { color: colors.light },
	current: { color: colors.secondary, fontWeight: 'bold' },
	dots: { color: colors.medium, fontSize: 18 },
	flip: { transform: [{ scaleX: -1 }] },
	viewProducts: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
	link: { color: colors.light, textDecorationLine: 'underline' },
	box: { padding: 10, alignItems: 'center', backgroundColor: colors.secondary, borderRadius: 4, marginBottom: 6 },
	paid: { padding: 8, backgroundColor: colors.success, alignItems: 'center' },
	paidText: { color: colors.dark, fontWeight: 'bold' },
});
