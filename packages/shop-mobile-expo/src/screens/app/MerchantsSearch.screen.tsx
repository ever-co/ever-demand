import React from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { useQuery, useLazyQuery } from '@apollo/client';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
import { debounce } from 'lodash';

// TYPES/INTERFACES
import type {} from '../../client/products/argumentInterfaces';

// HELPERS
import { isEmpty } from '../../helpers/utils';

// STORE
import { useAppSelector } from '../../store/hooks';
// import { getUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// QUERIES
import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	TouchableCard,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

function MerchantsSearch({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	// const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [searchedValue, setSearchedValue] = React.useState<string>('');
	const [dataLoading, setDataLoading] = React.useState<boolean>(false);

	// DATA
	const MERCHANTS_SEARCH_QUERY_ARGS: any = {};

	// QUERIES
	const MERCHANTS_SEARCH_QUERY = useLazyQuery(
		GEO_LOCATION_PRODUCTS_BY_PAGING,
		{
			variables: {
				...MERCHANTS_SEARCH_QUERY_ARGS,
			},
		},
	);

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
		containerSearchInput: { ...GS.flex1, ...GS.mr2, height: 57 },
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
				setDataLoading(false);
				MERCHANTS_SEARCH_QUERY[0]();
				console.log(
					'API launched ====>',
					text,
					MERCHANTS_SEARCH_QUERY[1].data,
				);
			}, 500),
		[MERCHANTS_SEARCH_QUERY.data],
	);

	// EFFECTS
	React.useEffect(() => {
		if (!isEmpty(searchedValue)) {
			debouncedFetchData(searchedValue);
		} else {
			setDataLoading(false);
		}

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
				title={LANGUAGE.PRODUCTS_VIEW.TITLE}
				showBackBtn
			/>

			<View style={STYLES.searchContainer}>
				<View style={STYLES.containerSearchInput}>
					<TextInput
						value={searchedValue}
						placeholder='Search here'
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

				<Button
					style={STYLES.scanBtn}
					theme={{ roundness: CS.SPACE }}
					uppercase={false}
					mode='contained'>
					<MaterialIcon
						name='qrcode-scan'
						color={CC.light}
						size={16}
					/>{' '}
					Scan
				</Button>
			</View>

			{!isEmpty(searchedValue) && (
				<View style={{ ...GS.centered, ...GS.pt3, ...GS.pb4 }}>
					<Text style={STYLES.searchedText}>
						{LANGUAGE.MERCHANTS_VIEW.WITH_NAME} "{searchedValue}"
					</Text>
				</View>
			)}

			{MERCHANTS_SEARCH_QUERY[1].loading || dataLoading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={CC.white} size={25} />
				</View>
			) : MERCHANTS_SEARCH_QUERY[1]?.data?.length ? (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.px2 }}>
					{[''].map((_item, index) => (
						<TouchableCard
							key={index}
							img='https://github.com/ever-co/ever-demand-docs/blob/master/docs/assets/shop/mobile/in-store/merchants_near_search.png?raw=true'
							title='Item'
							titleStyle={{ color: CC.primary }}
							indicatorIconProps={{ name: 'chevron-right' }}
							height={65}
							onPress={() => {}}
						/>
					))}
				</ScrollView>
			) : (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.screen, ...GS.centered }}>
					<Title>Nothing found!</Title>
				</ScrollView>
			)}
		</View>
	);
}

export default MerchantsSearch;
