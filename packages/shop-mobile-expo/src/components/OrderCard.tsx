/** Order card (Ionic `e-cu-order-card` + `e-cu-order` + `e-cu-order-product`, §4.13). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { env } from '../config/env';
import { OrderStatus } from '../domain/enums';
import {
	customerAddress,
	deliveryDuration,
	isOrderCanceled,
	isOrderFailed,
	isOrderInProcessing,
	isTakeawayOrder,
	orderStatus,
	orderStatusText,
	orderTotalPrice,
	orderWarehouse,
} from '../domain/order';
import { orderProductImage, pickTranslation, shorten } from '../domain/product';
import type { Order, OrderProduct } from '../domain/types';
import { useLanguage } from '../hooks/useLanguage';
import { useServices } from '../services/container';
import { colors } from '../theme';
import { WarehouseLogo } from './ProductBits';

export const NOT_EXPANDED_MAX_PRODUCTS = 3;

function badgeColor(order: Order): string {
	switch (orderStatus(order)) {
		case OrderStatus.CanceledWhileInDelivery:
		case OrderStatus.CanceledWhileWarehousePreparation:
			return colors.energized;
		case OrderStatus.CarrierIssue:
		case OrderStatus.WarehouseIssue:
			return colors.danger;
		default:
			return colors.balanced;
	}
}

function OrderProductRow({
	orderId,
	product,
	inProcessing,
	removed,
	onRemove,
	onComment,
}: {
	orderId: string;
	product: OrderProduct;
	inProcessing: boolean;
	removed: boolean;
	onRemove: () => void;
	onComment: (comment: string) => void;
}) {
	const { t } = useTranslation();
	const language = useLanguage();
	const [editing, setEditing] = useState(false);
	const [comment, setComment] = useState(product.comment ?? '');
	const image = orderProductImage(product.product.images ?? [], language);
	const description = shorten(pickTranslation(product.product.description, language, env.DEFAULT_LANGUAGE), 53);
	const imageStyle =
		image?.orientation === 1 ? styles.vertical : image?.orientation === 2 ? styles.horizontal : styles.square;

	return (
		<View style={[styles.product, removed && styles.removed]} testID={`order-product-${orderId}`}>
			{image && <Image source={{ uri: image.url }} style={[styles.productImage, imageStyle]} />}
			<View style={styles.productContent}>
				<Text style={styles.productTitle}>
					{pickTranslation(product.product.title, language, env.DEFAULT_LANGUAGE)}{' '}
					<Text style={styles.qty}>{product.count}</Text>
				</Text>
				<Text style={styles.productDescription}>{description}</Text>
				<Text style={styles.detailsLink}>{t('ORDER_HISTORY_VIEW.DETAILS')}</Text>
				{inProcessing && (
					<View>
						{editing ? (
							<TextInput
								value={comment}
								onChangeText={setComment}
								onBlur={() => {
									setEditing(false);
									onComment(comment);
								}}
								onSubmitEditing={() => {
									setEditing(false);
									onComment(comment);
								}}
								placeholder={t('EXPO.ORDER_INFO_MODAL.COMMENT')}
								placeholderTextColor={colors.medium}
								style={styles.commentInput}
								multiline
								testID='order-product-comment-input'
							/>
						) : (
							<Pressable onPress={() => setEditing(true)} testID='order-product-comment'>
								<Text style={styles.comment}>
									{product.comment ? product.comment : t('EXPO.ORDER_INFO_MODAL.ADD_COMMENT')}{' '}
									{!!product.comment && <MaterialCommunityIcons name='pencil' size={12} />}
								</Text>
							</Pressable>
						)}
					</View>
				)}
			</View>
			<Text style={styles.productPrice}>${product.count * product.price}</Text>
			{inProcessing && (
				<Pressable onPress={onRemove} style={styles.remove} testID='order-product-remove' accessibilityLabel='Remove'>
					<MaterialCommunityIcons name='delete' size={20} color={colors.light} />
				</Pressable>
			)}
		</View>
	);
}

export function OrderCard({
	order: initialOrder,
	showAll = false,
	onPress,
	onMore,
}: {
	order: Order;
	showAll?: boolean;
	onPress?: () => void;
	onMore?: () => void;
}) {
	const { t } = useTranslation();
	const language = useLanguage();
	const { routers } = useServices();
	const [order, setOrder] = useState(initialOrder);
	const [removedIds, setRemovedIds] = useState<string[]>([]);

	React.useEffect(() => setOrder(initialOrder), [initialOrder]);

	const products = showAll ? order.products : order.products.slice(0, NOT_EXPANDED_MAX_PRODUCTS);
	const hidden = order.products.length - products.length;
	const inProcessing = isOrderInProcessing(order);
	const takeaway = isTakeawayOrder(order);
	const duration = deliveryDuration(order);
	const createdAt = order.createdAt ? new Date(order.createdAt) : null;

	const remove = async (product: OrderProduct) => {
		const productId = product.product._id ?? product.product.id;
		try {
			await routers.order.removeProducts(order.id, [productId]);
			setRemovedIds((ids) => [...ids, product.id ?? product._id ?? productId]);
			setOrder({
				...order,
				products: order.products.map((p) => (p === product ? { ...p, price: 0 } : p)),
			});
		} catch (error) {
			console.warn('Could not remove the product', error);
		}
	};

	const comment = async (product: OrderProduct, text: string) => {
		const orderProductId = product.id ?? product._id;
		if (!orderProductId) {
			return;
		}
		try {
			const updated = await routers.order.addProductComment(order.id, orderProductId, text);
			if (updated) {
				setOrder(updated);
			}
		} catch (error) {
			console.warn('Could not save the comment', error);
		}
	};

	return (
		<Card style={styles.card} testID={`order-card-${order.id}`}>
			<Pressable onPress={onPress} disabled={!onPress}>
				<View style={styles.header}>
					<WarehouseLogo logo={orderWarehouse(order)?.logo} size={44} />
					<View style={styles.address}>
						<Text style={styles.addressTop}>
							{t('TO')}: {customerAddress(order)}
						</Text>
						<Text style={styles.addressBottom}>{createdAt ? createdAt.toLocaleString() : ''}</Text>
						<View style={styles.stateRow}>
							<Text style={[styles.badge, { backgroundColor: badgeColor(order) }]} testID='order-status-badge'>
								{orderStatusText(order, language)}
							</Text>
							<Text style={styles.state} testID='order-state'>
								{inProcessing
									? t('PENDING')
									: takeaway
										? t('COMPLETED')
										: duration
											? duration
											: isOrderCanceled(order)
												? t('CANCELED')
												: isOrderFailed(order)
													? t('FAILED')
													: t('IN_DELIVERY')}
							</Text>
						</View>
					</View>
					<Text style={styles.total} testID='order-total'>
						${orderTotalPrice(order) || '0'}
					</Text>
				</View>
				<View style={styles.hr} />
				{products.map((product, index) => (
					<OrderProductRow
						key={product.id ?? product._id ?? index}
						orderId={order.id}
						product={product}
						inProcessing={inProcessing}
						removed={product.price === 0 || removedIds.includes(product.id ?? product._id ?? '')}
						onRemove={() => void remove(product)}
						onComment={(text) => void comment(product, text)}
					/>
				))}
			</Pressable>
			{hidden > 0 && (
				<Pressable onPress={onMore} style={styles.more} testID='order-card-more'>
					<MaterialCommunityIcons name='chevron-down' size={18} color={colors.light} />
					<Text style={styles.moreText}>
						{hidden} {t('MORE')}
					</Text>
				</Pressable>
			)}
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { backgroundColor: colors.primaryLight, marginBottom: 10 },
	header: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
	address: { flex: 1 },
	addressTop: { color: colors.light, fontSize: 13 },
	addressBottom: { color: colors.medium, fontSize: 12 },
	stateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
	badge: { color: colors.dark, fontSize: 11, paddingHorizontal: 6, borderRadius: 8, overflow: 'hidden' },
	state: { color: colors.light, fontSize: 11 },
	total: { color: colors.light, fontSize: 18, fontWeight: 'bold' },
	hr: { height: 1, backgroundColor: colors.medium, opacity: 0.4 },
	product: { flexDirection: 'row', padding: 10, gap: 8, alignItems: 'flex-start' },
	removed: { opacity: 0.4 },
	productImage: { backgroundColor: colors.black, borderRadius: 4 },
	vertical: { width: 56, height: 80 },
	horizontal: { width: 96, height: 56 },
	square: { width: 64, height: 64 },
	productContent: { flex: 1 },
	productTitle: { color: colors.light, fontWeight: 'bold' },
	qty: { color: colors.secondary },
	productDescription: { color: colors.medium, fontSize: 12 },
	detailsLink: { color: colors.secondary, fontSize: 12 },
	comment: { color: colors.light, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
	commentInput: { color: colors.light, borderColor: colors.medium, borderWidth: 1, padding: 4, marginTop: 4 },
	productPrice: { color: colors.light, fontWeight: 'bold' },
	remove: { padding: 4 },
	more: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
	moreText: { color: colors.light },
});
