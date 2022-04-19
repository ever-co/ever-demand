import React from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Title, Text } from 'react-native-paper';
import { useLazyQuery } from '@apollo/client';
import { debounce } from 'lodash';

// TYPES/INTERFACES
import type {
	QueryGetMerchantsByNameArgsInterface,
	MerchantsSearchedInterface,
} from '../../client/merchants/argumentInterfaces';
import type {
	ProductsQueryArgsInterface,
	ProductInfoInterface,
} from '../../client/products/argumentInterfaces';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// QUERIES
import { GET_MERCHANTS_QUERY } from '../../client/merchants/queries';
import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	TouchableCard,
	ProductHistoryItem,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

function SearchScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [searchedValue, setSearchedValue] = React.useState<string>('');
	const [dataLoading, setDataLoading] = React.useState<boolean>(false);

	// QUERIES
	const MERCHANTS_SEARCH_QUERY = useLazyQuery(GET_MERCHANTS_QUERY);
	const PRODUCTS_SEARCH_QUERY = useLazyQuery(GEO_LOCATION_PRODUCTS_BY_PAGING);

	// STYLES
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		searchContainer: {
			...GS.px2,
			...GS.row,
			...GS.centered,
			...GS.pt2,
			height: 90,
			backgroundColor: CC.dark,
		},
		containerSearchInput: { ...GS.flex1, height: 57 },
		searchInput: {
			...GS.bgLight,
			...GS.flex1,
			marginTop: -6,
			color: CC.dark,
			fontSize: CS.FONT_SIZE - 1,
		},
		scanBtn: { ...GS.p0, ...GS.my0, ...GS.justifyCenter, height: 57 },
		searchedText: { ...GS.FF_NunitoBold, ...GS.txtUpper },
	});

	// FUNCTIONS
	const debouncedFetchData = React.useMemo(
		() =>
			debounce((text: string) => {
				const MERCHANTS_SEARCH_QUERY_ARGS: QueryGetMerchantsByNameArgsInterface =
					{
						searchName: text,
						geoLocation: {
							loc: {
								type:
									USER_DATA?.geoLocation?.coordinates
										?.__typename || 'Point',
								coordinates: [
									USER_DATA?.geoLocation?.coordinates?.lng ||
										0,
									USER_DATA?.geoLocation?.coordinates?.lat ||
										0,
								],
							},
						},
					};
				const PRODUCTS_SEARCH_QUERY_ARGS: ProductsQueryArgsInterface = {
					geoLocation: {
						loc: {
							type:
								USER_DATA?.geoLocation?.coordinates
									?.__typename || 'Point',
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
					searchText: text,
				};

				setDataLoading(false);
				MERCHANTS_SEARCH_QUERY[0]({
					variables: MERCHANTS_SEARCH_QUERY_ARGS,
				});
				PRODUCTS_SEARCH_QUERY[0]({
					variables: PRODUCTS_SEARCH_QUERY_ARGS,
				});
			}, 500),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	// EFFECTS
	React.useEffect(() => {
		debouncedFetchData(searchedValue);

		return () => debouncedFetchData.cancel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchedValue]);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader
				title={
					LANGUAGE.PRODUCTS_VIEW.TITLE + ' / ' + LANGUAGE.MERCHANTS
				}
				showBackBtn
			/>

			<View style={STYLES.searchContainer}>
				<View style={STYLES.containerSearchInput}>
					<TextInput
						value={searchedValue}
						placeholder={LANGUAGE.SEARCH_VIEW.SEARCH_PLACEHOLDER?.toLowerCase()}
						style={STYLES.searchInput}
						theme={{
							colors: { text: CC.dark },
							roundness: CS.SPACE,
						}}
						placeholderTextColor={CC.gray}
						left={
							<TextInput.Icon
								name='search'
								color={CC.dark}
								size={18}
								style={GS.mt1}
							/>
						}
						onChangeText={(text) => {
							setDataLoading(true);
							setSearchedValue(text);
						}}
						mode='outlined'
					/>
				</View>
			</View>

			{MERCHANTS_SEARCH_QUERY[1].loading ||
			PRODUCTS_SEARCH_QUERY[1].loading ||
			dataLoading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={CC.white} size={25} />
				</View>
			) : MERCHANTS_SEARCH_QUERY[1]?.data?.getMerchantsBuyName?.length ||
			  PRODUCTS_SEARCH_QUERY[1]?.data?.geoLocationProductsByPaging
					?.length ? (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.px2 }}>
					<View>
						<View style={{ ...GS.centered, ...GS.pt3, ...GS.pb4 }}>
							<Text style={STYLES.searchedText}>
								{LANGUAGE.MERCHANTS}
							</Text>
						</View>

						{(MERCHANTS_SEARCH_QUERY[1]?.data
							? (MERCHANTS_SEARCH_QUERY[1]?.data
									?.getMerchantsBuyName as MerchantsSearchedInterface[])
							: []
						).map((_item, _index) => (
							<TouchableCard
								key={_index}
								img={_item.logo}
								title={_item.name}
								titleStyle={{ color: CC.primary }}
								indicatorIconProps={{ name: 'chevron-right' }}
								height={65}
								style={GS.mb2}
								onPress={() => {}}
							/>
						))}
					</View>

					<View>
						<View style={{ ...GS.centered, ...GS.pt3, ...GS.pb4 }}>
							<Text style={STYLES.searchedText}>
								{LANGUAGE.PRODUCTS_VIEW.TITLE}
							</Text>
						</View>

						{(PRODUCTS_SEARCH_QUERY[1]?.data
							? (PRODUCTS_SEARCH_QUERY[1]?.data
									?.geoLocationProductsByPaging as ProductInfoInterface[])
							: []
						).map((_item, _index) => (
							<View key={_index} style={GS.mb2}>
								<ProductHistoryItem
									image={
										_item?.warehouseProduct?.product
											?.images[0].url
									}
									title={
										_item?.warehouseProduct?.product
											?.title[0]?.value
									}
									description={
										_item?.warehouseProduct?.product
											?.description[0].value
									}
									amount={_item?.warehouseProduct?.price}
									onPress={() => {}}
								/>
							</View>
						))}
					</View>
				</ScrollView>
			) : (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{
						...GS.screen,
						...GS.centered,
						...GS.px2,
					}}>
					<Title>{LANGUAGE.SEARCH_VIEW.EMPTY_LIST}</Title>
				</ScrollView>
			)}
		</View>
	);
}

export default SearchScreen;
