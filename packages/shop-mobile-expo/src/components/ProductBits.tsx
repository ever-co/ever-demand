/** Small product widgets: merchant logo, discount badge, delivery badge, Buy / Details buttons. */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { env } from '../config/env';
import { deliveryInfo, discountPercent } from '../domain/product';
import type { WarehouseProduct } from '../domain/types';
import { useAppSelector } from '../store';
import { colors } from '../theme';

export function WarehouseLogo({ logo, size = 48, style }: { logo?: string | null; size?: number; style?: ViewStyle }) {
	return (
		<View
			style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }, style]}
			testID='warehouse-logo'>
			{!!logo && <Image source={{ uri: logo }} style={styles.logoImage} resizeMode='contain' />}
		</View>
	);
}

export function DiscountBadge({ product }: { product: Pick<WarehouseProduct, 'price' | 'initialPrice'> | null }) {
	const discount = discountPercent(product);
	if (!product || discount === 0) {
		return null;
	}
	return (
		<View style={styles.discount} testID='discount-badge'>
			<Text style={styles.discountInitial}>${product.initialPrice}</Text>
			<Text style={styles.discountText}>
				<MaterialCommunityIcons name='content-cut' size={12} color={colors.white} /> {discount}%
			</Text>
		</View>
	);
}

export function DeliveryInfoBadge({ product }: { product: Pick<WarehouseProduct, 'deliveryTimeMin' | 'deliveryTimeMax'> | null }) {
	const { t } = useTranslation();
	const deliveryType = useAppSelector((state) => state.session.deliveryType);
	const info = deliveryInfo(
		product,
		deliveryType,
		{
			minutes: t('PRODUCTS_VIEW.MINUTES'),
			readyFor: t('PRODUCTS_VIEW.READYFOR'),
			delivery: t('PRODUCTS_VIEW.DELIVERY'),
			takeaway: t('PRODUCTS_VIEW.TAKEAWAY'),
		},
		{ min: env.DELIVERY_TIME_MIN, max: env.DELIVERY_TIME_MAX },
	);
	if (!info) {
		return null;
	}
	return (
		<View style={styles.delivery} testID='delivery-info'>
			<MaterialCommunityIcons name={info.icon} size={18} color={colors.light} />
			<View>
				<Text style={styles.deliveryLine}>{info.line1}</Text>
				<Text style={styles.deliveryLine}>{info.line2}</Text>
			</View>
		</View>
	);
}

export function BuyButton({
	price,
	soldOut,
	onPress,
	testID = 'buy-button',
}: {
	price: number;
	soldOut?: boolean;
	onPress: () => void;
	testID?: string;
}) {
	const { t } = useTranslation();
	const label = soldOut
		? t('PRODUCTS_VIEW.NOT_AVAILABLE')
		: `${t('PRODUCTS_VIEW.BUY_BUTTON.PRE')}${price}$${t('PRODUCTS_VIEW.BUY_BUTTON.SUF')}`;
	return (
		<Button
			mode='contained'
			disabled={soldOut}
			onPress={() => !soldOut && onPress()}
			style={styles.buy}
			testID={testID}
			accessibilityLabel={label}>
			{label}
		</Button>
	);
}

const styles = StyleSheet.create({
	logo: {
		backgroundColor: colors.white,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	logoImage: { width: '69%', height: '69%' },
	discount: {
		position: 'absolute',
		top: 8,
		left: 8,
		zIndex: 2,
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: colors.secondary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	discountInitial: { color: colors.light, textDecorationLine: 'line-through', fontSize: 12 },
	discountText: { color: colors.white, fontWeight: 'bold' },
	delivery: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	deliveryLine: { color: colors.light, fontSize: 11 },
	buy: { flex: 1 },
});
