import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import PagerView from 'react-native-pager-view';

// CONFIGS

// TYPES/INTERFACES
import type {
	ProductInfoInterface,
	ProductsQueryArgsInterface,
} from '../../client/products/argumentInterfaces';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getUserData, getProductViewType } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// ACTIONS

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

function HomeScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);
	const VIEW_TYPE = useAppSelector(getProductViewType);

	// STATES

	// DATA
	const PRODUCTS_QUERY_ARGS_INTERFACE: ProductsQueryArgsInterface = {
		geoLocation: {
			loc: {
				type: 'Point',
				coordinates: [
					USER_DATA?.geoLocation
						? USER_DATA?.geoLocation?.coordinates?.lng
						: 0,
					USER_DATA?.geoLocation
						? USER_DATA?.geoLocation?.coordinates?.lat
						: 0,
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
	const styles = StyleSheet.create({
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
				title={LANGUAGE.PRODUCTS_VIEW.TITLE}
				showControls
			/>

			{PRODUCTS_QUERY_RESPONSE.loading ? (
				<View style={styles.loaderContainer}>
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
						renderItem={({ item, index }) => {
							return (
								<View style={styles.productItemContainer}>
									<ProductItem
										type={VIEW_TYPE}
										data={{ ...item, id: index }}
									/>
								</View>
							);
						}}
						keyExtractor={(_item, _index) => _index.toString()}
						style={{ ...GS.h100 }}
					/>
				) : (
					<PagerView style={{ ...GS.screen }}>
						{PRODUCTS_QUERY_RESPONSE.data?.geoLocationProductsByPaging?.map(
							(item: ProductInfoInterface, index: number) => (
								<View key={index}>
									<ProductItem
										key={index}
										type={VIEW_TYPE}
										data={{ ...item }}
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

export default HomeScreen;
