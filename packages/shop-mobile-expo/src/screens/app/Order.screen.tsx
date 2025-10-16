import React from 'react';
import MapView from 'react-native-maps';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, Button, Title } from 'react-native-paper';
import { useQuery } from '@apollo/client';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import FontAwesomeIcon from '@expo/vector-icons/FontAwesome';

// TYPES/INTERFACES
import type { QueryGeolocationProductsByPagingArgsInterface } from '../../client/products/argumentInterfaces';

// SELECTORS
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getUserData } from '../../store/features/user';

import { setPreselectedProduct } from '../../store/features/order';
import { getLanguage } from '../../store/features/translation';

// QUERIES
import { GEO_LOCATION_PRODUCTS_BY_PAGING } from '../../client/products/queries';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

function OrderScreen({}) {
	// DISPATCHER
	const dispatcher = useAppDispatch();

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);
	const USER_DATA = useAppSelector(getUserData);

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
		map: { ...GS.w100, ...GS.mb5, height: 200 },
		footer: {
			...GS.inlineItems,
			...GS.p2,
		},
		footerBtn: {
			minWidth: CS.FONT_SIZE_XLG * 6,
		},
		footerBtnLabel: {
			...GS.py1,
			color: CC.light,
		},
		footerUndoBtn: {
			backgroundColor: CC.primaryLight,
		},
		footerBuyBtn: {
			...GS.bgSecondary,
			...GS.ml1,
			flex: 1,
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
			) : (
				<View style={GS.flex1}>
					<ScrollView
						style={{ ...GS.flex1 }}
						contentContainerStyle={{
							...GS.alignCenter,
							...GS.py2,
						}}>
						<View
							style={{
								...GS.centered,
								...GS.px2,
								...GS.pt4,
								...GS.mt4,
								...GS.pb5,
								...GS.mb5,
							}}>
							<Title style={{ ...GS.fontBold }}>
								{LANGUAGE.BUY_POPUP.STATUSES_TAKEAWAY.TITLE}
							</Title>
							<Text>We will get it in 30-60-minutes</Text>
							<Text>Prepare your wallet (40.00$ in cash)</Text>
						</View>

						<MapView
							initialRegion={{
								latitude: 37.78825,
								longitude: -122.4324,
								latitudeDelta: 0.0922,
								longitudeDelta: 0.0421,
							}}
							style={STYLES.map}
						/>

						<Title style={{ ...GS.fontBold }}>
							{LANGUAGE.BUY_POPUP.ELAPSED_TIME.TITLE}
						</Title>
						<Text style={{ ...GS.fontBold }}>00:00</Text>

						<View
							style={{
								...GS.inlineItems,
								...GS.mt4,
								...GS.pt4,
							}}>
							<View style={{ ...GS.alignCenter, ...GS.mr3 }}>
								<Text style={{ ...GS.mb2, ...GS.fontBold }}>
									{LANGUAGE.BUY_POPUP.DELIVERY_STATUS.WE}
								</Text>
								<FontAwesomeIcon
									name='building'
									color={CC.light}
									size={CS.FONT_SIZE_XLG * 2}
								/>
							</View>

							<View style={{ ...GS.row, ...GS.mr3 }}>
								<View style={{ ...GS.justifyEnd, ...GS.mr3 }}>
									<Text
										style={{
											fontSize: CS.FONT_SIZE_LG * 1.5,
										}}>
										..
									</Text>
								</View>
								<View style={{ ...GS.alignCenter }}>
									<Text style={{ ...GS.mb2, ...GS.fontBold }}>
										{
											LANGUAGE.BUY_POPUP.DELIVERY_STATUS
												.CARRIER
										}
									</Text>
									<FontAwesomeIcon
										name='motorcycle'
										color={CC.light}
										size={CS.FONT_SIZE_XLG * 2}
									/>
								</View>
							</View>

							<View style={{ ...GS.row }}>
								<View style={{ ...GS.justifyEnd, ...GS.mr3 }}>
									<Text
										style={{
											fontSize: CS.FONT_SIZE_LG * 1.5,
										}}>
										..
									</Text>
								</View>
								<View style={{ ...GS.alignCenter }}>
									<Text style={{ ...GS.mb2, ...GS.fontBold }}>
										{LANGUAGE.BUY_POPUP.DELIVERY_STATUS.YOU}
									</Text>
									<FontAwesomeIcon
										name='home'
										color={CC.light}
										size={CS.FONT_SIZE_XLG * 2}
									/>
								</View>
							</View>
						</View>
					</ScrollView>

					<View style={STYLES.footer}>
						<Button
							uppercase={false}
							style={{
								...STYLES.footerBtn,
								...STYLES.footerUndoBtn,
							}}
							labelStyle={STYLES.footerBtnLabel}>
							{LANGUAGE.BUY_POPUP.BUTTONS.UNDO}
						</Button>
						<Button
							uppercase={false}
							style={{
								...STYLES.footerBtn,
								...STYLES.footerBuyBtn,
							}}
							labelStyle={STYLES.footerBtnLabel}>
							{LANGUAGE.BUY_POPUP.BUTTONS.PAY_NOW}
						</Button>
					</View>
				</View>
			)}
		</View>
	);
}

export default OrderScreen;
