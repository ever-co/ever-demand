import React from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
// import { useQuery } from '@apollo/client';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';

// CONFIGS

// TYPES/INTERFACES
import type {} from '../../client/products/argumentInterfaces';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
// import { getUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// ACTIONS

// QUERIES
// import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

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
} from '../../assets/ts/styles';

function MerchantsSearch({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	// const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [searchValue, setSearchValue] = React.useState<string>('');
	// const [dataLoading, setDataLoading] = React.useState<boolean>(false);

	// DATA
	// const MERCHANTS_SEARCH_QUERY_ARGS: any = {};

	// QUERIES
	// const MERCHANTS_SEARCH_QUERY_RESPONSE = useQuery(
	// 	GEO_LOCATION_PRODUCTS_BY_PAGING,
	// 	{
	// 		variables: {
	// 			...MERCHANTS_SEARCH_QUERY_ARGS,
	// 		},
	// 	},
	// );

	// STYLES
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		searchContainer: {
			...GS.px2,
			...GS.pt4,
			...GS.pb3,
			...GS.inlineItems,
			backgroundColor: CC.dark,
		},
		searchInput: {
			...GS.mr2,
			...GS.my0,
			...GS.bgLight,
			flex: 1,
			color: CC.dark,
			height: 57,
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
				showBackBtn
			/>

			<View style={STYLES.searchContainer}>
				<TextInput
					value={searchValue}
					placeholder='Search here'
					style={STYLES.searchInput}
					theme={{ colors: { text: CC.dark } }}
					placeholderTextColor={CC.gray}
					left={
						<TextInput.Icon
							name='search'
							color={CC.dark}
							size={20}
						/>
					}
					onChangeText={(text) => setSearchValue(text)}
					mode='outlined'
				/>

				<Button
					style={{ ...GS.py2, ...GS.my0 }}
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

			{false ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={'#FFF'} size={25} />
				</View>
			) : true ? (
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.px2 }}>
					{[''].map((_item, index) => (
						<TouchableCard
							key={index}
							title='Item'
							onPress={() => {}}
						/>
					))}
				</ScrollView>
			) : (
				<View style={{ ...GS.screen, ...GS.centered }}>
					<Title>Nothing found!</Title>
				</View>
			)}
		</View>
	);
}

export default MerchantsSearch;
