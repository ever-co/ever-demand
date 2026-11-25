/** Takeaway store info and title (feature inventory §4.8). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { orderWarehouse, storeFullAddress } from '../domain/order';
import type { Order } from '../domain/types';
import { useServices } from '../services/container';
import { useAppSelector } from '../store';
import { colors } from '../theme';
import { OrderStatusTexts } from './OrderTracking';

export function TakeawayStoreInfo({
	order,
	lessInfo = false,
	onOpenMap,
}: {
	order: Order | null;
	lessInfo?: boolean;
	onOpenMap?: () => void;
}) {
	const { t } = useTranslation();
	const { call } = useServices();
	const inStore = useAppSelector((state) => state.session.inStore);
	const warehouse = orderWarehouse(order);

	const attemptCall = async () => {
		if (warehouse?.contactPhone && !(await call(warehouse.contactPhone))) {
			console.warn('Call Was Unsuccessful!');
		}
	};

	return (
		<View style={[styles.container, !lessInfo && styles.centered]} testID='takeaway-store-info'>
			{!lessInfo && <Text style={styles.title}>{t('STORE_INFO')}</Text>}
			<Text style={lessInfo ? styles.title : styles.text} testID='takeaway-store-name'>
				{warehouse?.name}
			</Text>
			{!inStore && (
				<Pressable onPress={onOpenMap} disabled={!onOpenMap} style={styles.row} testID='takeaway-store-address'>
					{lessInfo && <MaterialCommunityIcons name='map' size={18} color={colors.light} />}
					<Text style={[styles.text, lessInfo && styles.underline]}>{storeFullAddress(warehouse)}</Text>
				</Pressable>
			)}
			{!!warehouse?.contactPhone && (
				<Pressable onPress={() => void attemptCall()} style={styles.row} testID='takeaway-store-phone'>
					<MaterialCommunityIcons name='phone' size={18} color={colors.light} />
					<Text style={[styles.text, styles.underline]}>{warehouse.contactPhone}</Text>
				</Pressable>
			)}
		</View>
	);
}

export function TakeawayTitle({ order, onViewProducts }: { order: Order | null; onViewProducts?: () => void }) {
	return <OrderStatusTexts order={order} keyPrefix='BUY_POPUP.STATUSES_TAKEAWAY' onViewProducts={onViewProducts} />;
}

const styles = StyleSheet.create({
	container: { padding: 8, gap: 4 },
	centered: { alignItems: 'center' },
	title: { color: colors.light, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
	text: { color: colors.light },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	underline: { textDecorationLine: 'underline' },
});
