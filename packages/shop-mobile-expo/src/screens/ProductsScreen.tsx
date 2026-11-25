/** Product feed (`/products`, feature inventory §4.4 and §4.5). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';
import { AppHeader } from '../components/AppHeader';
import { ProductsListView, ProductsSlidesView } from '../components/ProductViews';
import { SearchPanel } from '../components/SearchPanel';
import { DeliveryType, RegistrationSystem } from '../domain/enums';
import type { Location, ProductInfo, Product, Warehouse } from '../domain/types';
import { useGuard } from '../hooks/useGuard';
import { useLanguage } from '../hooks/useLanguage';
import { useObservable } from '../hooks/useObservable';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { useProductFeed } from '../hooks/useProductFeed';
import { navigate, navigateRoot } from '../navigation/actions';
import { inviteEntry } from '../navigation/guards';
import { useServices } from '../services/container';
import { toLocation } from '../services/location';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { sessionActions } from '../store/session';
import { colors } from '../theme';

function StoreSign({ inStore, onPress }: { inStore: boolean; onPress: () => void }) {
	const { t } = useTranslation();
	return (
		<Pressable onPress={onPress} style={styles.sign} testID='store-sign' accessibilityRole='button'>
			<MaterialCommunityIcons name={inStore ? 'logout' : 'login'} size={20} color={colors.light} />
			<Text style={styles.signText}>{inStore ? t('EXIT_STORE') : t('IN_STORE')}</Text>
		</Pressable>
	);
}

function OrderSign({ onPress }: { onPress: () => void }) {
	const { graphql } = useServices();
	const orderId = useAppSelector((state) => state.session.orderId);
	const revision = useAppSelector((state) => state.ui.orderRevision);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		let active = true;
		if (orderId) {
			graphql
				.getOrderTotalPrice(orderId)
				.then((price) => active && setTotal(price))
				.catch(() => undefined);
		}
		return () => {
			active = false;
		};
	}, [graphql, orderId, revision]);

	return (
		<Pressable onPress={onPress} style={styles.sign} testID='order-sign' accessibilityRole='button'>
			<MaterialCommunityIcons name='basket' size={20} color={colors.light} />
			<Text style={styles.signText}>{total}$</Text>
		</Pressable>
	);
}

export function ProductsScreen() {
	const allowed = useGuard('Products');
	const { t } = useTranslation();
	const services = useServices();
	const { env, routers, graphql } = services;
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const navigation = useNavigation();
	const language = useLanguage();
	const { buyAndShow, showOrderInfo } = useOrderFlow();

	const userId = useAppSelector((state) => state.session.userId);
	const deviceId = useAppSelector((state) => state.session.deviceId);
	const inStore = useAppSelector((state) => state.session.inStore);
	const orderId = useAppSelector((state) => state.session.orderId);
	const deliveryType = useAppSelector((state) => state.session.deliveryType);
	const modalOpen = useAppSelector((state) => state.ui.modal != null);

	const [location, setLocation] = useState<Location | null>(null);
	const [searchOpen, setSearchOpen] = useState(false);

	const hasPendingOrder = !!orderId;
	const navigateToMerchants = env.MERCHANT_IDS.length < 1 && !inStore;
	const imageOrientation = env.PRODUCTS_VIEW_TYPE === 'list' ? 0 : 1;

	// In store mode the purchase type is always takeaway.
	useEffect(() => {
		if (inStore && deliveryType !== DeliveryType.Takeaway) {
			dispatch(sessionActions.setDeliveryType(DeliveryType.Takeaway));
		}
	}, [deliveryType, dispatch, inStore]);

	const merchant = useObservable<Warehouse>(
		() => (inStore ? routers.warehouse.get(inStore, false) : null),
		[inStore],
	).value;

	const placeholder = useObservable<string>(
		() => (userId ? routers.userProducts.getPlaceholder(userId, deviceId) : null),
		[userId, deviceId],
	).value;

	// Location of the feed: the user's address in production, else the current location.
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				if (userId && env.PRODUCTION) {
					const user = await firstValueFrom(routers.user.get(userId));
					if (user?.geoLocation?.loc) {
						active && setLocation(user.geoLocation.loc);
						return;
					}
				}
				const coords = await services.location.getCurrentCoords();
				active && setLocation(toLocation(coords));
			} catch (error) {
				console.warn(error);
				if (active) {
					dispatch(sessionActions.setRegistrationSystem(RegistrationSystem.Once));
					navigateRoot(inviteEntry(store.getState().session));
				}
			}
		})();
		return () => {
			active = false;
		};
	}, [dispatch, env.PRODUCTION, routers, services.location, store, userId]);

	const feed = useProductFeed({
		location,
		deliveryType: inStore ? DeliveryType.Takeaway : deliveryType,
		inStore,
		imageOrientation,
		locale: language || env.DEFAULT_LOCALE,
	});

	// A new feed whenever its filters change (delivery type, store mode, location).
	const { reset, loadMore } = feed;
	useEffect(() => {
		reset();
	}, [reset, deliveryType, inStore, location]);

	useEffect(() => {
		if (location && feed.products.length === 0 && !feed.loaded) {
			void loadMore();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadMore, location]);

	// Resume a Buy that started before the invite (`continueOrder`), and in popup mode show the
	// open order (`hasOrder`).
	useEffect(() => {
		const session = store.getState().session;
		if (session.buyProduct) {
			const { buyProduct, warehouseId } = session;
			dispatch(sessionActions.clearPendingBuy());
			if (session.userId && warehouseId) {
				graphql
					.getWarehouseProduct(warehouseId, buyProduct)
					.then((product) => {
						const id = product && typeof product.product === 'object' ? product.product.id : null;
						if (id) {
							void buyAndShow({ productId: id, warehouseId, resumeId: buyProduct });
						}
					})
					.catch((error) => console.warn('Could not resume the order', error));
			}
		} else if (session.orderId && env.ORDER_INFO_TYPE === 'popup') {
			void showOrderInfo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onBuy = useCallback(
		async (product: ProductInfo) => {
			const result = await buyAndShow({
				productId: product.warehouseProduct.product.id,
				warehouseId: product.warehouseId || store.getState().session.warehouseId || '',
				resumeId: product.warehouseProduct.id,
			});
			if (result === 'failed') {
				feed.markSoldOut(product.warehouseProduct.id);
			}
		},
		[buyAndShow, feed, store],
	);

	const onDetails = useCallback(
		async (product: ProductInfo) => {
			try {
				const found = await graphql.getWarehouseProduct(product.warehouseId, product.warehouseProduct.id);
				if (found) {
					navigate('ProductDetails', {
						id: (product.warehouseProduct.product as Product).id,
						warehouseId: product.warehouseId,
						backUrl: '/products',
					});
				} else {
					feed.markSoldOut(product.warehouseProduct.id);
				}
			} catch (error) {
				console.warn('Could not open the product', error);
			}
		},
		[feed, graphql],
	);

	const toggleDeliveryType = () => {
		if (!hasPendingOrder) {
			dispatch(
				sessionActions.setDeliveryType(
					deliveryType === DeliveryType.Delivery ? DeliveryType.Takeaway : DeliveryType.Delivery,
				),
			);
		}
	};

	const changeStoreMode = () => {
		if (inStore) {
			dispatch(sessionActions.setInStore(null));
		} else if (!navigateToMerchants) {
			// All the ids belong to one merchant (single merchant, several branches).
			dispatch(sessionActions.setInStore(env.MERCHANT_IDS[0]));
		}
	};

	const viewProps = useMemo(
		() => ({
			products: feed.products,
			productsCount: feed.productsCount,
			loaded: feed.loaded,
			placeholder: placeholder ?? null,
			language,
			onBuy,
			onDetails,
			onLoadMore: () => void feed.loadMore(),
		}),
		[feed, language, onBuy, onDetails, placeholder],
	);

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	const isDelivery = deliveryType === DeliveryType.Delivery;

	return (
		<View style={styles.screen} testID='products-screen'>
			<AppHeader title={inStore ? `${merchant?.name ?? ''} ${t('PRODUCTS_VIEW.TITLE')}` : undefined}>
				<View style={styles.actions}>
					{!inStore && !hasPendingOrder && (
						<View style={styles.toggle}>
							<Text
								style={[styles.toggleLabel, isDelivery && styles.unselected]}
								onPress={toggleDeliveryType}>
								{t('PRODUCTS_VIEW.TAKEAWAY')}
							</Text>
							<Switch
								value={isDelivery}
								onValueChange={toggleDeliveryType}
								color={colors.secondary}
								testID='delivery-type-toggle'
							/>
							<Text
								style={[styles.toggleLabel, !isDelivery && styles.unselected]}
								onPress={toggleDeliveryType}>
								{t('PRODUCTS_VIEW.DELIVERY')}
							</Text>
						</View>
					)}
					{!hasPendingOrder && (
						<Pressable
							onPress={() => setSearchOpen((open) => !open)}
							style={styles.sign}
							testID='search-toggle'
							accessibilityLabel='Search'>
							<MaterialCommunityIcons name='magnify' size={22} color={colors.light} />
						</Pressable>
					)}
					{!hasPendingOrder && (
						<StoreSign
							inStore={!!inStore}
							onPress={() =>
								navigateToMerchants ? navigation.navigate('Merchants' as never) : changeStoreMode()
							}
						/>
					)}
					{hasPendingOrder && <OrderSign onPress={() => void showOrderInfo()} />}
				</View>
			</AppHeader>
			<View style={[styles.content, modalOpen && styles.blurred]}>
				{location &&
					(searchOpen ? (
						<SearchPanel
							location={location}
							deliveryType={deliveryType}
							language={language}
							onOpenProduct={(product) => void onDetails(product)}
						/>
					) : env.PRODUCTS_VIEW_TYPE === 'list' ? (
						<ProductsListView {...viewProps} />
					) : (
						<ProductsSlidesView {...viewProps} />
					))}
			</View>
		</View>
	);
}


const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.black },
	content: { flex: 1 },
	blurred: { opacity: 0.35 },
	actions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
	toggle: { flexDirection: 'row', alignItems: 'center' },
	toggleLabel: { color: colors.light, fontSize: 11, marginHorizontal: 2 },
	unselected: { color: colors.medium },
	sign: { alignItems: 'center', paddingHorizontal: 6 },
	signText: { color: colors.light, fontSize: 10 },
});
