/** Product feed layouts: slides (one card per page, swiped) and list (cards, infinite scroll). */
import { useCallback, useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
	type LayoutChangeEvent,
	type ListViewToken,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { pickTranslation, shorten } from '../domain/product';
import type { ProductInfo } from '../domain/types';
import { env } from '../config/env';
import { colors } from '../theme';
import { HtmlView } from './HtmlView';
import { BuyButton, DeliveryInfoBadge, DiscountBadge, WarehouseLogo } from './ProductBits';

export interface ProductViewProps {
	products: ProductInfo[];
	productsCount: number;
	loaded: boolean;
	placeholder: string | null;
	language: string;
	onBuy: (product: ProductInfo) => void;
	onDetails: (product: ProductInfo) => void;
	onLoadMore: () => void;
}

/** Products with `count === 0` are hidden (the Ionic `showProducts` getter). */
export const visibleProducts = (products: ProductInfo[]) => products.filter((p) => p.warehouseProduct.count !== 0);

function ProductCardBody({
	product,
	language,
	maxDescription,
	onBuy,
	onDetails,
	imageHeight,
}: {
	product: ProductInfo;
	language: string;
	maxDescription: number;
	onBuy: () => void;
	onDetails: () => void;
	imageHeight: number;
}) {
	const { t } = useTranslation();
	const wp = product.warehouseProduct;
	const title = pickTranslation(wp.product.title, language, env.DEFAULT_LANGUAGE);
	const description = shorten(pickTranslation(wp.product.description, language, env.DEFAULT_LANGUAGE), maxDescription);
	const image = pickTranslation(wp.product.images, language, env.DEFAULT_LANGUAGE);

	return (
		<Card style={styles.card} testID={`product-card-${wp.id}`}>
			<View style={styles.cardHeader}>
				<WarehouseLogo logo={product.warehouseLogo} />
				<View style={styles.cardTitles}>
					<Text style={styles.title} numberOfLines={1} testID='product-title'>
						{title}
					</Text>
					<Text style={styles.description} numberOfLines={2}>
						{description}
					</Text>
				</View>
				<DeliveryInfoBadge product={wp} />
			</View>
			<View style={[styles.imageContainer, { height: imageHeight }]}>
				<DiscountBadge product={wp} />
				{!!image && <Image source={{ uri: image }} style={styles.image} resizeMode='cover' />}
			</View>
			<View style={styles.actions}>
				<BuyButton price={wp.price} soldOut={product.soldOut} onPress={onBuy} />
				<Button
					mode='outlined'
					disabled={product.soldOut}
					onPress={onDetails}
					textColor={colors.light}
					style={styles.details}
					testID='details-button'>
					{t('PRODUCTS_VIEW.DETAILS.DETAILS')}
				</Button>
			</View>
		</Card>
	);
}

function EmptyFeed({ loaded, placeholder, count }: { loaded: boolean; placeholder: string | null; count: number }) {
	if (!loaded) {
		return <ActivityIndicator color={colors.light} style={styles.spinner} testID='products-loading' />;
	}
	if (count === 0 && placeholder) {
		return <HtmlView html={placeholder} testID='products-placeholder' />;
	}
	return <View testID='products-empty' />;
}

export function ProductsListView(props: ProductViewProps) {
	const shown = visibleProducts(props.products);
	return (
		<FlatList
			testID='products-list'
			data={shown}
			keyExtractor={(item) => item.warehouseProduct.id}
			contentContainerStyle={styles.listContent}
			renderItem={({ item }) => (
				<ProductCardBody
					product={item}
					language={props.language}
					maxDescription={53}
					imageHeight={220}
					onBuy={() => props.onBuy(item)}
					onDetails={() => props.onDetails(item)}
				/>
			)}
			onEndReachedThreshold={0.5}
			onEndReached={() => {
				if (props.productsCount > props.products.length) {
					props.onLoadMore();
				}
			}}
			ListEmptyComponent={
				<EmptyFeed loaded={props.loaded} placeholder={props.placeholder} count={props.products.length} />
			}
			ListFooterComponent={
				props.loaded || shown.length === 0 ? undefined : <ActivityIndicator color={colors.light} />
			}
		/>
	);
}

export function ProductsSlidesView(props: ProductViewProps) {
	const shown = visibleProducts(props.products);
	const window = useWindowDimensions();
	const [measured, setSize] = useState({ width: 0, height: 0 });
	// Until the first layout (and in tests) the window size stands in.
	const size = {
		width: measured.width || window.width,
		height: measured.height || Math.max(0, window.height - 64),
	};
	const [index, setIndex] = useState(0);
	const propsRef = useRef(props);
	propsRef.current = props;

	const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
		const current = viewableItems[0]?.index ?? 0;
		setIndex(current);
		const { products, productsCount, onLoadMore } = propsRef.current;
		// The Ionic slides load 10 more when the slide about to show is the last or second to last.
		if (products.length - 1 <= current + 1 && productsCount > products.length) {
			onLoadMore();
		}
	}).current;

	const onLayout = useCallback((event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setSize({ width, height });
	}, []);

	return (
		<View style={styles.slides} onLayout={onLayout} testID='products-slides'>
			{shown.length > 0 && (
				<View style={styles.progress}>
					<View
						style={[
							styles.progressBar,
							{ width: `${Math.min(100, ((index + 1) / Math.max(1, props.productsCount)) * 100)}%` },
						]}
					/>
				</View>
			)}
			{size.width > 0 && (
				<FlatList
					data={shown}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item) => item.warehouseProduct.id}
					onViewableItemsChanged={onViewableItemsChanged}
					viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
					getItemLayout={(_, i) => ({ length: size.width, offset: size.width * i, index: i })}
					renderItem={({ item }) => (
						<View style={{ width: size.width, padding: 8 }} testID='product-slide'>
							<ProductCardBody
								product={item}
								language={props.language}
								maxDescription={45}
								imageHeight={Math.max(200, size.height - 220)}
								onBuy={() => props.onBuy(item)}
								onDetails={() => props.onDetails(item)}
							/>
						</View>
					)}
					ListEmptyComponent={
						<View style={{ width: size.width }}>
							<EmptyFeed loaded={props.loaded} placeholder={props.placeholder} count={props.products.length} />
						</View>
					}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: { backgroundColor: colors.primary, marginBottom: 12, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 },
	cardTitles: { flex: 1 },
	title: { color: colors.light, fontSize: 16, fontWeight: 'bold' },
	description: { color: colors.medium, fontSize: 12 },
	imageContainer: { backgroundColor: colors.black },
	image: { width: '100%', height: '100%' },
	actions: { flexDirection: 'row', padding: 8, gap: 8 },
	details: { borderColor: colors.secondary },
	listContent: { padding: 8, flexGrow: 1 },
	spinner: { marginTop: 48 },
	slides: { flex: 1 },
	progress: { height: 3, backgroundColor: colors.primaryLight },
	progressBar: { height: 3, backgroundColor: colors.secondary },
});
