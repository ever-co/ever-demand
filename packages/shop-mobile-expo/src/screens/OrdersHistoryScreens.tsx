/** Orders history and order details (`/orders-history`, `/orders-history/:id`, §4.13). */
import { useQuery } from '@apollo/client/react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/AppHeader';
import { OrderCard } from '../components/OrderCard';
import { DeliveryType } from '../domain/enums';
import { isOrderInProcessing } from '../domain/order';
import type { Order } from '../domain/types';
import { ORDER_DETAILS, ORDERS_HISTORY } from '../graphql/documents';
import { useGuard } from '../hooks/useGuard';
import { goBack, navigateRoot } from '../navigation/actions';
import type { RootParamList } from '../navigation/types';
import { useServices } from '../services/container';
import { useAppSelector } from '../store';
import { colors } from '../theme';

export function OrdersHistoryScreen() {
	const allowed = useGuard('OrdersHistory');
	const { t } = useTranslation();
	const { env } = useServices();
	const navigation = useNavigation();
	const userId = useAppSelector((state) => state.session.userId);
	const deliveryType = useAppSelector((state) => state.session.deliveryType);
	const { data, loading } = useQuery<{ getOrders: Order[] }>(ORDERS_HISTORY, {
		variables: { userId: userId ?? '' },
		skip: !userId,
	});
	const orders = data?.getOrders;

	const openOrder = (order: Order) => {
		// Tapping an order in progress opens its tracking page (page mode only).
		if (isOrderInProcessing(order) && env.ORDER_INFO_TYPE === 'page') {
			navigateRoot(deliveryType === DeliveryType.Delivery ? 'OrderInfo' : 'OrderTakeawayInfo');
		}
	};

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<View style={styles.screen} testID='orders-history-screen'>
			<AppHeader title={t('ORDER_HISTORY_VIEW.TITLE')} />
			{loading && !orders ? (
				<ActivityIndicator color={colors.light} style={styles.spinner} testID='orders-loading' />
			) : orders && orders.length > 0 ? (
				<FlatList
					data={orders}
					keyExtractor={(order) => order.id}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<OrderCard
							order={item}
							onPress={() => openOrder(item)}
							onMore={() => navigation.navigate('OrderDetails' as never, { id: item.id } as never)}
						/>
					)}
					testID='orders-list'
				/>
			) : (
				<View style={styles.empty} testID='orders-empty'>
					<MaterialCommunityIcons name='shopping' size={64} color={colors.medium} />
					<Text style={styles.emptyText}>{t('LAST_PURCHASES_VIEW.NOTHING_ORDERED')}</Text>
					<Button mode='contained' compact onPress={() => navigateRoot('Products')} testID='to-products-button'>
						{t('LAST_PURCHASES_VIEW.TO_PRODUCTS')}
					</Button>
				</View>
			)}
		</View>
	);
}

export function OrderDetailsScreen() {
	const allowed = useGuard('OrderDetails');
	const { t } = useTranslation();
	const { params } = useRoute<RouteProp<RootParamList, 'OrderDetails'>>();
	const { data } = useQuery<{ getOrder: Order | null }>(ORDER_DETAILS, {
		variables: { id: params?.id ?? '' },
		skip: !params?.id,
		fetchPolicy: 'network-only',
	});
	const order = data?.getOrder;

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<View style={styles.screen} testID='order-details-screen'>
			<AppHeader title={t('EXPO.ORDER_INFO_MODAL.TITLE')} onBack={() => goBack('OrdersHistory')} />
			{order ? (
				<ScrollView contentContainerStyle={styles.list}>
					<OrderCard order={order} showAll />
				</ScrollView>
			) : (
				<ActivityIndicator color={colors.light} style={styles.spinner} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.dark },
	spinner: { marginTop: 48 },
	list: { padding: 8 },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
	emptyText: { color: colors.light, fontSize: 20 },
});
