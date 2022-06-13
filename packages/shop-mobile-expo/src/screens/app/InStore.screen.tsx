import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import PagerView from 'react-native-pager-view';

// CONFIGS

// TYPES/INTERFACES
import type { WarehouseProductInterface } from '../../client/types';
import type { QueryGetStoreProductsArgs } from '../../client/merchants/argumentInterfaces';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getProductViewType } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// ACTIONS

// QUERIES
import { GET_STORED_PRODUCT } from '../../client/merchants/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	ProductItem,
} from '../../components/Common';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

function InStoreScreen({}) {
	// NAVIGATION
	const ROUTE = useRoute();

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	// const USER_DATA = useAppSelector(getUserData);
	const VIEW_TYPE = useAppSelector(getProductViewType);

	// ROUTE PARAMS
	const WAREHOUSE_ID =
		(ROUTE?.params as { warehouseId: string })?.warehouseId || '';

	// DATA
	const WAREHOUSE_PRODUCTS_QUERY_ARGS_INTERFACE: QueryGetStoreProductsArgs = {
		storeId: WAREHOUSE_ID,
		fullProducts: true,
	};

	// QUERIES
	const WAREHOUSE_PRODUCTS_QUERY_RESPONSE = useQuery(GET_STORED_PRODUCT, {
		variables: {
			...WAREHOUSE_PRODUCTS_QUERY_ARGS_INTERFACE,
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

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader
				title={
					LANGUAGE.IN_STORE +
					(WAREHOUSE_PRODUCTS_QUERY_RESPONSE?.data?.warehouse?.name
						? ' / ' +
						  WAREHOUSE_PRODUCTS_QUERY_RESPONSE?.data?.warehouse
								?.name
						: '')
				}
				showBackBtn
			/>

			{WAREHOUSE_PRODUCTS_QUERY_RESPONSE.loading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={'#FFF'} size={25} />
				</View>
			) : WAREHOUSE_PRODUCTS_QUERY_RESPONSE.data?.getStoreProducts &&
			  WAREHOUSE_PRODUCTS_QUERY_RESPONSE.data?.getStoreProducts
					.length ? (
				VIEW_TYPE === 'list' ? (
					<FlatList
						data={
							WAREHOUSE_PRODUCTS_QUERY_RESPONSE.data
								?.getStoreProducts as WarehouseProductInterface[]
						}
						renderItem={({ item }) => (
							<View style={STYLES.productItemContainer}>
								<ProductItem
									type={VIEW_TYPE}
									data={{
										warehouseId:
											WAREHOUSE_PRODUCTS_QUERY_RESPONSE
												.data?.warehouse?.id,
										warehouseLogo:
											WAREHOUSE_PRODUCTS_QUERY_RESPONSE
												.data?.warehouse?.logo,
										productId: item.id,
										title: item.product.title[0].value,
										description:
											item.product.description[0].value,
										coverImage: item.product.images.length
											? item.product.images[0].url
											: undefined,
										price: item.price,
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
						{WAREHOUSE_PRODUCTS_QUERY_RESPONSE.data?.getStoreProducts?.map(
							(
								item: WarehouseProductInterface,
								index: number,
							) => (
								<View key={index}>
									<ProductItem
										key={index}
										type={VIEW_TYPE}
										data={{
											warehouseId:
												WAREHOUSE_PRODUCTS_QUERY_RESPONSE
													.data?.warehouse?.id,
											warehouseLogo:
												WAREHOUSE_PRODUCTS_QUERY_RESPONSE
													.data?.warehouse?.logo,
											productId: item.id,
											title: item.product.title[0].value,
											description:
												item.product.description[0]
													.value,
											coverImage: item.product.images
												.length
												? item.product.images[0].url
												: undefined,
											price: item.price,
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

export default InStoreScreen;
