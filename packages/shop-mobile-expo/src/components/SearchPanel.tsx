/** Search panel of the feed (Ionic `search-products`): merchants and products by text. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { env } from '../config/env';
import { DeliveryType } from '../domain/enums';
import { pickTranslation, shorten } from '../domain/product';
import type { Location, Merchant, ProductInfo } from '../domain/types';
import { useServices } from '../services/container';
import { colors } from '../theme';
import { WarehouseLogo } from './ProductBits';

const PRODUCTS_LIMIT = 10;
const MERCHANTS_LIMIT = 5;

export function SearchPanel({
	location,
	deliveryType,
	language,
	onOpenProduct,
}: {
	location: Location;
	deliveryType: DeliveryType;
	language: string;
	onOpenProduct: (product: ProductInfo, shown: ProductInfo[]) => void;
}) {
	const { t } = useTranslation();
	const { graphql } = useServices();
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(true);
	const [merchants, setMerchants] = useState<Merchant[]>([]);
	const [allMerchantsShown, setAllMerchantsShown] = useState(false);
	const [products, setProducts] = useState<ProductInfo[]>([]);
	const [allProductsShown, setAllProductsShown] = useState(false);
	const searchRun = useRef(0);

	const options = {
		isDeliveryRequired: deliveryType === DeliveryType.Delivery,
		isTakeaway: deliveryType === DeliveryType.Takeaway,
	};

	const loadMerchants = useCallback(
		async (searchText: string, shown: Merchant[], fresh: boolean) => {
			const found = await graphql.getMerchantsByName(searchText, { loc: location });
			const next = fresh
				? found.slice(0, MERCHANTS_LIMIT)
				: [...shown, ...found.slice(shown.length, shown.length + MERCHANTS_LIMIT)];
			setMerchants(next);
			setAllMerchantsShown(found.length === next.length);
		},
		[graphql, location],
	);

	const loadProducts = useCallback(
		async (searchText: string, shown: ProductInfo[], fresh: boolean) => {
			const found = await graphql.geoLocationProducts(
				{ loc: location },
				{ limit: PRODUCTS_LIMIT, skip: fresh ? 0 : shown.length },
				options,
				searchText,
			);
			const next = fresh ? found : [...shown, ...found];
			setProducts(next);
			const count = await graphql.countGeoLocationProducts({ loc: location }, options, searchText);
			setAllProductsShown(count === next.length);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[graphql, location, deliveryType],
	);

	useEffect(() => {
		const run = ++searchRun.current;
		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				await loadMerchants(text, [], true);
				await loadProducts(text, [], true);
			} catch (error) {
				console.warn('Search failed', error);
			} finally {
				if (run === searchRun.current) {
					setLoading(false);
				}
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [loadMerchants, loadProducts, text]);

	return (
		<View style={styles.container} testID='search-panel'>
			<Searchbar
				value={text}
				onChangeText={setText}
				placeholder={t('SEARCH_VIEW.SEARCH_PLACEHOLDER')}
				style={styles.searchbar}
				testID='search-input'
			/>
			{loading ? (
				<ActivityIndicator color={colors.light} style={styles.spinner} testID='search-loading' />
			) : (
				<ScrollView contentContainerStyle={styles.results}>
					{merchants.length === 0 && products.length === 0 && (
						<Text style={styles.empty} testID='search-empty'>
							{t('SEARCH_VIEW.EMPTY_LIST')}
						</Text>
					)}
					{merchants.map((merchant) => (
						<Card key={merchant.id} style={styles.card} testID={`search-merchant-${merchant.id}`}>
							<View style={styles.row}>
								<WarehouseLogo logo={merchant.logo} size={40} />
								<Text style={styles.name}>{merchant.name}</Text>
								<Text style={merchant.isActive ? styles.open : styles.closed}>
									{merchant.isActive ? t('SEARCH_VIEW.OPEN') : t('SEARCH_VIEW.CLOSED')}
								</Text>
							</View>
						</Card>
					))}
					{merchants.length > 0 && (
						<Button
							disabled={allMerchantsShown}
							onPress={() => loadMerchants(text, merchants, false)}
							testID='search-more-merchants'>
							{t('SEARCH_VIEW.VIEW_MORE')}
						</Button>
					)}
					{products.map((product) => {
						const wp = product.warehouseProduct;
						return (
							<Card
								key={wp.id}
								style={styles.card}
								onPress={() => onOpenProduct(product, products)}
								testID={`search-product-${wp.id}`}>
								<View style={styles.row}>
									<Image
										source={{ uri: pickTranslation(wp.product.images, language, env.DEFAULT_LANGUAGE) }}
										style={styles.image}
									/>
									<View style={styles.info}>
										<Text style={styles.name}>
											{pickTranslation(wp.product.title, language, env.DEFAULT_LANGUAGE)}
										</Text>
										<Text style={styles.description}>
											{shorten(pickTranslation(wp.product.description, language, env.DEFAULT_LANGUAGE), 100)}
										</Text>
									</View>
									<Badge style={styles.price}>{`${wp.price}$`}</Badge>
								</View>
							</Card>
						);
					})}
					{products.length > 0 && (
						<Button
							disabled={allProductsShown}
							onPress={() => loadProducts(text, products, false)}
							testID='search-more-products'>
							{t('SEARCH_VIEW.VIEW_MORE')}
						</Button>
					)}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.primaryLight },
	searchbar: { margin: 8 },
	spinner: { marginTop: 32 },
	results: { padding: 8 },
	empty: { color: colors.light, padding: 16, textAlign: 'center' },
	card: { marginBottom: 8, backgroundColor: colors.primary },
	row: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 },
	name: { color: colors.light, flex: 1, fontWeight: 'bold' },
	description: { color: colors.medium, fontSize: 12 },
	info: { flex: 1 },
	image: { width: 64, height: 64, borderRadius: 4 },
	price: { backgroundColor: colors.primary, color: colors.light },
	open: { color: colors.success },
	closed: { color: colors.danger },
});
