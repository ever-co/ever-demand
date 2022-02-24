import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Button, TextInput, Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import MaterialIcon from '@expo/vector-icons/MaterialCommunityIcons';
// CONFIGS

// TYPES/INTERFACES
import type {} from '../../client/products/argumentInterfaces';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getUserData } from '../../store/features/user';
import { getLanguage } from '../../store/features/translation';

// ACTIONS

// QUERIES
import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	TouchableCard,
	Icon,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

function MerchantsSearch({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

	// STATES
	const [searchValue, setSearchValue] = React.useState<string>('');
	const [dataLoading, setDataLoading] = React.useState<boolean>(false);

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
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		searchContainer: {
			...GS.px1,
			...GS.pt3,
			...GS.pb2,
			backgroundColor: CC.dark + '55',
		},
		searchInput: { ...GS.mr2, flex: 1 },
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
					left={<Icon name='search' />}
					onChangeText={(text) => setSearchValue(text)}
				/>

				<Button uppercase={false} mode='contained' color={CC.light}>
					<MaterialIcon name='qrcode-scan' color={CC.light} /> Scan
				</Button>
			</View>

			{false ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color={'#FFF'} size={25} />
				</View>
			) : true ? (
				[''].map(() => <TouchableCard title='Item' />)
			) : (
				<View style={{ ...GS.screen, ...GS.centered }}>
					<Title>Nothing found!</Title>
				</View>
			)}
		</View>
	);
}

export default MerchantsSearch;
