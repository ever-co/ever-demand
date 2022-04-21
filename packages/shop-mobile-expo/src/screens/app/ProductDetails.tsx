import React from 'react';
import { useQuery } from '@apollo/client';
import { useRoute } from '@react-navigation/native';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import {
	Text,
	Paragraph,
	ActivityIndicator,
	Button,
	Avatar,
} from 'react-native-paper';

// CLIENTS
import { WAREHOUSE_PRODUCT_QUERY } from '../../client/products/queries';
import { QueryGetWarehouseProductArgs } from '../../client/products/argumentInterfaces';

// STORE
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import {
	CustomScreenHeader,
	FocusAwareStatusBar,
} from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
} from '../../assets/ts/styles';

const ProductDetails = () => {
	// ROUTE
	const ROUTE = useRoute();

	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// QUERIES
	const WAREHOUSE_PRODUCT_QUERY_ARGS_INTERFACE: QueryGetWarehouseProductArgs =
		{
			warehouseId: (ROUTE?.params as any)?.warehouseId || '',
			warehouseProductId: (ROUTE?.params as any)?.productId || '',
		};
	const WAREHOUSE_PRODUCT_QUERY_RESPONSE = useQuery(WAREHOUSE_PRODUCT_QUERY, {
		variables: {
			...WAREHOUSE_PRODUCT_QUERY_ARGS_INTERFACE,
		},
	});

	// DATA
	const SLIDER_IMAGE_HEIGHT = 180;

	// LOCAL STYLES
	const STYLES = StyleSheet.create({
		header: {
			...GS.mt2,
			...GS.py2,
			...GS.px2,
			...GS.inlineItems,
		},
		headerTitle: {
			...GS.FF_NunitoSemiBold,
			fontSize: CS.FONT_SIZE_MD,
		},
		headerSubtitle: {
			color: CC.grayLight,
		},
		sliderImagesContainer: {
			height: SLIDER_IMAGE_HEIGHT,
		},
		sliderImage: {
			...GS.mr1,
			height: SLIDER_IMAGE_HEIGHT,
			width: CS.WINDOW_WIDTH / 2,
		},
		bodyContent: { ...GS.pt5, ...GS.px4 },
		bodyTitle: {
			...GS.FF_NunitoSemiBold,
			...GS.mb2,
			fontSize: CS.FONT_SIZE_MD,
		},
		buyBtn: {
			height: 50,
		},
	});

	console.log(
		'WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data',
		WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data,
	);

	return (
		<View style={GS.screen}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>

			<CustomScreenHeader
				title={LANGUAGE.PRODUCTS_VIEW.DETAILS.DETAILS}
				showBackBtn
			/>

			{WAREHOUSE_PRODUCT_QUERY_RESPONSE?.loading ? (
				<View style={{ ...GS.centered, ...GS.flex1 }}>
					<ActivityIndicator color={CC.light} />
				</View>
			) : (
				<>
					<View style={STYLES.header}>
						<Avatar.Image
							source={{
								uri: WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data
									?.warehouse?.logo,
							}}
							style={GS.mr3}
							size={50}
						/>

						<View style={GS.flex1}>
							<Text style={STYLES.headerTitle}>
								{
									WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data
										?.getWarehouseProduct?.product?.title[0]
										.value
								}
							</Text>
							<Text style={STYLES.headerSubtitle}>
								{
									WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data
										?.getWarehouseProduct?.product
										?.description[0].value
								}
							</Text>
						</View>

						<View>
							<View />
						</View>
					</View>

					<View style={STYLES.sliderImagesContainer}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}>
							{WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data?.getWarehouseProduct?.product?.images?.map(
								(image: any, index: number) => (
									<Image
										key={index}
										style={STYLES.sliderImage}
										source={{ uri: image.url }}
										resizeMode='cover'
									/>
								),
							)}
						</ScrollView>
					</View>

					<ScrollView
						style={GS.flex1}
						contentContainerStyle={STYLES.bodyContent}>
						<Text style={STYLES.bodyTitle}>
							{LANGUAGE.PRODUCTS_VIEW.DETAILS.INCLUDES}
						</Text>

						<Paragraph>
							{
								WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data
									?.getWarehouseProduct?.product?.details[0]
									.value
							}
						</Paragraph>
					</ScrollView>

					<View style={GS.p1}>
						<Button
							uppercase={false}
							mode='contained'
							contentStyle={STYLES.buyBtn}>
							Buy for{' '}
							{
								WAREHOUSE_PRODUCT_QUERY_RESPONSE?.data
									?.getWarehouseProduct?.price
							}
							$
						</Button>
					</View>
				</>
			)}
		</View>
	);
};

export default ProductDetails;
