import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import PagerView from 'react-native-pager-view';

// TYPES/INTERFACES
import type { ProductInfoInterface } from '../../client/types';
import type { QueryGeolocationProductsByPagingArgsInterface } from '../../client/products/argumentInterfaces';

// SELECTORS
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getUserData, getProductViewType } from '../../store/features/user';

import { setPreselectedProduct } from '../../store/features/order';
import { getLanguage } from '../../store/features/translation';

// QUERIES
import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	ProductItem,
} from '../../components/Common';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

function OrderScreen({}) {
	// DISPATCHER
	const dispatcher = useAppDispatch();

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);
	const VIEW_TYPE = useAppSelector(getProductViewType);

	// ROUTER
	const NAVIGATION = useNavigation();
	const ROUTE = useRoute();

	// DATA
	const PRODUCTS_QUERY_ARGS_INTERFACE: QueryGeolocationProductsByPagingArgsInterface =
		{
			geoLocation: {
				loc: {
					type: 'Point',
					coordinates: [
						USER_DATA?.user?.user.geoLocation?.coordinates?.lng ||
							USER_DATA?.invite?.geoLocation?.coordinates?.lng ||
							0,
						USER_DATA?.user?.user.geoLocation?.coordinates?.lat ||
							USER_DATA?.invite?.geoLocation?.coordinates?.lat ||
							0,
					],
				},
			},
		};

	// QUERIES
	const PRODUCTS_QUERY_RESPONSE = useQuery(GEO_LOCATION_PRODUCTS_BY_PAGING, {
		variables: {
			...PRODUCTS_QUERY_ARGS_INTERFACE,
		},
	});

	// STYLES
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		productItemContainer: {
			...GS.mx1,
			...GS.mt2,
			...GS.mb1,
		},
	});

	// EFFECTS
	React.useEffect(() => {
		const SELECTED_PRODUCT = (ROUTE.params as any)?.selectedProduct;

		(() => {
			if (!SELECTED_PRODUCT) {
				return NAVIGATION.goBack();
			}

			console.log('SELECTED_PRODUCT =====>', SELECTED_PRODUCT);
		})();

		return () => {
			dispatcher(setPreselectedProduct(null));
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader title={LANGUAGE.ORDER_INFO} showBackBtn />

			{PRODUCTS_QUERY_RESPONSE.loading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={'#FFF'} size={25} />
				</View>
			) : PRODUCTS_QUERY_RESPONSE.data?.geoLocationProductsByPaging &&
			  PRODUCTS_QUERY_RESPONSE.data?.geoLocationProductsByPaging
					.length ? (
				VIEW_TYPE === 'list' ? (
					<FlatList
						data={
							PRODUCTS_QUERY_RESPONSE.data
								?.geoLocationProductsByPaging
						}
						renderItem={({ item }) => (
							<View style={STYLES.productItemContainer}>
								<ProductItem
									type={VIEW_TYPE}
									data={{
										warehouseId: item.warehouseId,
										warehouseLogo: item.warehouseLogo,
										productId: item.warehouseProduct.id,
										title: item.warehouseProduct.product
											.title[0].value,
										description:
											item.warehouseProduct.product
												.description[0].value,
										coverImage: item.warehouseProduct
											.product.images.length
											? item.warehouseProduct.product
													.images[0].url
											: undefined,
										price: item.warehouseProduct.price,
									}}
								/>
							</View>
						)}
						keyExtractor={(_item, _index) => _index.toString()}
						style={{ ...GS.h100 }}
						overScrollMode='never'
						showsVerticalScrollIndicator={false}
					/>
				) : (
					<PagerView style={{ ...GS.screen }} overScrollMode='never'>
						{PRODUCTS_QUERY_RESPONSE.data?.geoLocationProductsByPaging?.map(
							(item: ProductInfoInterface, index: number) => (
								<View key={index}>
									<ProductItem
										key={index}
										type={VIEW_TYPE}
										data={{
											warehouseId: item.warehouseId,
											warehouseLogo: item.warehouseLogo,
											productId: item.warehouseProduct.id,
											title: item.warehouseProduct.product
												.title[0].value,
											description:
												item.warehouseProduct.product
													.description[0].value,
											coverImage: item.warehouseProduct
												.product.images.length
												? item.warehouseProduct.product
														.images[0].url
												: undefined,
											price: item.warehouseProduct.price,
										}}
									/>
								</View>
							),
						)}
					</PagerView>
				)
			) : (
				<View style={{ ...GS.screen, ...GS.centered }}>
					<Title>Nothing to buy for now.</Title>
				</View>
			)}
		</View>
	);
}

export default OrderScreen;
