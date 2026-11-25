/** Product details (`/products/product-details/:id?backUrl&warehouseId`, feature inventory §4.6). */
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/AppHeader';
import { BuyButton, DeliveryInfoBadge, DiscountBadge, WarehouseLogo } from '../components/ProductBits';
import { env } from '../config/env';
import { pickTranslation, productDetailsImages, shorten } from '../domain/product';
import type { Product, Warehouse, WarehouseProduct } from '../domain/types';
import { useLanguage } from '../hooks/useLanguage';
import { useObservable } from '../hooks/useObservable';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { goBack, navigateRoot } from '../navigation/actions';
import type { RootParamList } from '../navigation/types';
import { useServices } from '../services/container';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { sessionActions } from '../store/session';
import { colors } from '../theme';

const productOf = (wp: WarehouseProduct | undefined): Product | null =>
	wp && typeof wp.product === 'object' ? wp.product : null;

export function ProductDetailsScreen() {
	const { params } = useRoute<RouteProp<RootParamList, 'ProductDetails'>>();
	const { t } = useTranslation();
	const { routers } = useServices();
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const language = useLanguage();
	const { buyAndShow } = useOrderFlow();
	const modalOpen = useAppSelector((state) => state.ui.modal != null);
	const resumed = useRef(false);

	const warehouseId = params?.warehouseId;
	const productId = params?.id;

	const warehouse = useObservable<Warehouse>(
		() => (warehouseId ? routers.warehouse.get(warehouseId, true) : null),
		[warehouseId],
	).value;

	const warehouseProduct = useMemo(
		() => warehouse?.products?.find((p) => productOf(p)?.id === productId),
		[productId, warehouse],
	);
	const product = productOf(warehouseProduct);

	// Live "sold out": the product is gone from the store or its count is 0.
	const liveProducts = useObservable<WarehouseProduct[]>(
		() => (warehouseId && product ? routers.warehouseProducts.get(warehouseId, false) : null),
		[warehouseId, !!product],
	).value;
	const soldOut = useMemo(() => {
		if (!liveProducts || !warehouseProduct) {
			return false;
		}
		const live = liveProducts.find(
			(p) => (p.productId ?? (typeof p.product === 'string' ? p.product : p.product?.id)) === product?.id,
		);
		return !live || (live.count ?? 0) <= 0;
	}, [liveProducts, product, warehouseProduct]);

	const buy = () => {
		if (!product || !warehouseId) {
			return;
		}
		void buyAndShow({ productId: product.id, warehouseId, resumeId: product.id, fromDetails: true });
	};

	// After a forced invite: buy the remembered product once it has loaded (`continueOrder`).
	useEffect(() => {
		if (!product || resumed.current) {
			return;
		}
		resumed.current = true;
		const session = store.getState().session;
		if (session.userId) {
			if (session.buyProduct && session.buyProduct !== 'null') {
				dispatch(sessionActions.clearPendingBuy());
				buy();
			}
		} else {
			dispatch(sessionActions.clearPendingBuy());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product]);

	const images = productDetailsImages(product?.images);

	const back = () => {
		if (params?.backUrl && params.backUrl !== '/products') {
			goBack();
		} else {
			navigateRoot('Products');
		}
	};

	return (
		<View style={styles.screen} testID='product-details-screen'>
			<AppHeader title={t('PRODUCTS_VIEW.DETAILS.DETAILS')} onBack={back} backLabel={t('PRODUCTS_VIEW.DETAILS.BACK')} />
			{!product || !warehouseProduct ? (
				<ActivityIndicator color={colors.light} style={styles.spinner} testID='product-details-loading' />
			) : (
				<ScrollView contentContainerStyle={[styles.content, modalOpen && styles.blurred]}>
					<View style={styles.header}>
						<WarehouseLogo logo={warehouse?.logo} />
						<View style={styles.titles}>
							<Text style={styles.title} testID='product-details-title'>
								{pickTranslation(product.title, language, env.DEFAULT_LANGUAGE)}
							</Text>
							<Text style={styles.description}>
								{shorten(pickTranslation(product.description, language, env.DEFAULT_LANGUAGE), 53)}
							</Text>
						</View>
						<DeliveryInfoBadge product={warehouseProduct} />
					</View>
					<View style={styles.images}>
						<DiscountBadge product={warehouseProduct} />
						{images.single && (
							<Image
								source={{ uri: images.single.url }}
								style={images.single.orientation === 2 ? styles.fullImage : styles.halfImage}
								resizeMode='cover'
								testID='product-details-image'
							/>
						)}
						{images.carousel.length > 0 && (
							<FlatList
								horizontal
								data={images.carousel}
								keyExtractor={(image, index) => `${image.url}-${index}`}
								ItemSeparatorComponent={() => <View style={{ width: 5 }} />}
								renderItem={({ item }) => (
									<Image source={{ uri: item.url }} style={styles.carouselImage} resizeMode='cover' />
								)}
								testID='product-details-carousel'
							/>
						)}
					</View>
					<View style={styles.details}>
						<Text style={styles.includes}>{t('PRODUCTS_VIEW.DETAILS.INCLUDES')}</Text>
						<Text style={styles.description}>
							{pickTranslation(product.details, language, env.DEFAULT_LANGUAGE)}
						</Text>
					</View>
					<View style={styles.buy}>
						<BuyButton price={warehouseProduct.price} soldOut={soldOut} onPress={buy} testID='details-buy-button' />
					</View>
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.dark },
	spinner: { marginTop: 48 },
	content: { padding: 8 },
	blurred: { opacity: 0.35 },
	header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, backgroundColor: colors.primaryLight },
	titles: { flex: 1 },
	title: { color: colors.light, fontSize: 18, fontWeight: 'bold' },
	description: { color: colors.medium, fontSize: 13 },
	images: { minHeight: 220, backgroundColor: colors.black, justifyContent: 'center' },
	fullImage: { width: '100%', height: 260 },
	halfImage: { width: '50%', height: 260, alignSelf: 'center' },
	carouselImage: { width: 180, height: 260 },
	details: { padding: 12 },
	includes: { color: colors.light, fontWeight: 'bold', marginBottom: 4 },
	buy: { flexDirection: 'row', padding: 8 },
});
