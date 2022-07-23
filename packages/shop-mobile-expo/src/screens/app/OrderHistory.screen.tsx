import React from 'react';
import {
	View,
	ActivityIndicator,
	FlatList,
	StyleSheet,
	ScrollView,
} from 'react-native';
import { Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { showMessage } from 'react-native-flash-message';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';
import { getUserData } from '../../store/features/user/index';

// QUERIES CLIENT
import { GET_ORDER_HISTORY_QUERY } from '../../client/orders/queries';
import { QueryGetOrdersArgsInterface } from '../../client/orders/argumentInterfaces';

// COMPONENTS
import {
	CustomScreenHeader,
	FocusAwareStatusBar,
	OrderHistoryItem,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	// CONSTANT_SIZE as CS,
	// CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';
import { OrderHistoryInterface } from 'client/types';

const OrderHistoryScreen = () => {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

	// QUERIES
	const GET_ORDER_HISTORY_QUERY_ARGS: QueryGetOrdersArgsInterface = {
		userId: USER_DATA?.user?.user?.id || '',
	};
	const ORDERS_QUERY_RES = useQuery(GET_ORDER_HISTORY_QUERY, {
		variables: GET_ORDER_HISTORY_QUERY_ARGS,
	});

	// STYLES
	const STYLES = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		container: {
			...GS.screen,
			...GS.bgTransparent,
			...GS.px5,
			...GS.pb5,
			...GS.mx5,
			zIndex: 1,
		},
		orderHistoryItemContainer: {
			...GS.mt3,
			...GS.mb1,
			...GS.mx2,
		},
	});

	// EFFECT
	React.useEffect(() => {
		if (!USER_DATA?.user?.user?.id || ORDERS_QUERY_RES?.data?.Error) {
			showMessage({
				message: ORDERS_QUERY_RES?.data?.Error,
				type: 'warning',
			});
		}
	}, [
		ORDERS_QUERY_RES?.data,
		ORDERS_QUERY_RES.loading,
		USER_DATA?.user?.user?.id,
	]);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader
				title={LANGUAGE.ORDER_HISTORY_VIEW.TITLE}
				showHomeBtn
			/>

			{ORDERS_QUERY_RES?.loading ? (
				<View style={STYLES.loaderContainer}>
					<ActivityIndicator color='#FFF' size={25} />
				</View>
			) : ORDERS_QUERY_RES?.data ? (
				<FlatList
					data={
						ORDERS_QUERY_RES?.data
							?.getOrders as OrderHistoryInterface[]
					}
					renderItem={({ item }) => (
						<View style={STYLES.orderHistoryItemContainer}>
							<OrderHistoryItem
								data={{
									createdAt: item.createdAt,
									orderStatus: item.status,
									products: item.products,
									customerCity: item.user.geoLocation.city,
									customerStreetAddress:
										item.user.geoLocation.streetAddress,
									customerHouse: item.user.geoLocation.house,
									warehouseLogo: item.warehouse.logo,
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
				<ScrollView
					style={{ ...GS.screen }}
					contentContainerStyle={{ ...GS.screen, ...GS.centered }}>
					<Title>
						{LANGUAGE.LAST_PURCHASES_VIEW.NOTHING_ORDERED}
					</Title>
				</ScrollView>
			)}
		</View>
	);
};

export default OrderHistoryScreen;
