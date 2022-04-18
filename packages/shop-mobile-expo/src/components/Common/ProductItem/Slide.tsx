/* eslint-disable max-len */
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Avatar, Title, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import Ionicons from '@expo/vector-icons/Ionicons';

// TYPES
import type { ProductInfoInterface } from '../../../client/products/argumentInterfaces';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../../assets/ts/styles';

// LOCAL TYPES
export interface ProductItemType {
	data: ProductInfoInterface;
}

const ProductItemSlide: React.FC<ProductItemType> = (
	props: ProductItemType,
) => {
	// NAVIGATION
	const NAVIGATION = useNavigation();

	// DATA
	const AVATAR_WAREHOUSE_SIZE = CS.FONT_SIZE_XLG * 2.5;
	const STYLES = StyleSheet.create({
		container: {
			...GS.h100,
			...GS.w100,
			flex: 1,
			backgroundColor: CC.primary,
			position: 'relative',
			overflow: 'hidden',
		},
		prodImg: {
			flex: 1,
		},
		containerAvailabilities: {
			...GS.mt4,
			...GS.mr2,
			position: 'absolute',
			top: 0,
			right: 0,
		},
		availabilitiesItem: {
			...GS.centered,
			...GS.rounded,
			...GS.mb2,
			...GS.p1,
			backgroundColor: CC.primaryLight + 'cf',
			width: CS.FONT_SIZE_XLG * 3.5,
		},
		availabilitiesItemText: {
			...GS.FF_NunitoSemiBold,
			fontSize: CS.FONT_SIZE_SM,
			textAlign: 'center',
			lineHeight: 12,
		},
		availabilitiesItemTextLG: {
			...GS.FF_NunitoSemiBold,
			fontSize: CS.FONT_SIZE_LG,
		},
		availabilitiesItemTextPrice: {
			textDecorationLine: 'line-through',
		},
		section: {
			...GS.p2,
			...GS.inlineItems,
		},
		header: {
			...GS.mb5,
			position: 'relative',
		},
		headerContent: {
			flex: 1,
			marginRight: AVATAR_WAREHOUSE_SIZE + CS.SPACE_SM,
		},
		headerAvatarContainer: {
			...GS.shadow,
			...GS.mr2,
			borderRadius: 100,
			borderWidth: 2,
			borderColor: CC.light,
			position: 'absolute',
			top: -(AVATAR_WAREHOUSE_SIZE / 2),
			right: 0,
		},
		headerContentTitle: {
			...GS.fontBold,
			...GS.mb1,
			fontSize: CS.FONT_SIZE_XLG,
			color: CC.light,
		},
		headerContentDescription: {
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_MD,
			color: CC.grayLight,
		},
		footer: {},
		footerBtn: {
			...GS.py1,
			minWidth: CS.FONT_SIZE_XLG * 6,
		},
		footerBuyBtn: {
			...GS.bgSecondary,
			...GS.mr1,
			flex: 1,
		},
		footerDetailBtn: {
			backgroundColor: CC.primaryLight,
		},
	});

	// FUNCTIONS
	const onPressProfile = () => {
		NAVIGATION.navigate(
			'DRAWER/IN_STORE' as never,
			{
				warehouseId: props.data.warehouseId,
			} as never,
		);
	};

	return (
		<View style={STYLES.container}>
			<Image
				style={STYLES.prodImg}
				source={{
					uri: props?.data?.warehouseProduct?.product?.images?.length
						? props?.data?.warehouseProduct?.product?.images[0].url
						: 'https://static.vecteezy.com/system/resources/previews/004/941/788/original/cardboard-boxes-or-packaging-paper-and-shipping-box-carton-parcels-and-delivery-packages-pile-flat-warehouse-goods-and-cargo-transportation-design-illustration-vector.jpg',
				}}
			/>

			<View style={STYLES.containerAvailabilities}>
				<View style={STYLES.availabilitiesItem}>
					<Text
						style={{
							...STYLES.availabilitiesItemTextLG,
							...STYLES.availabilitiesItemTextPrice,
						}}>
						$139
					</Text>

					<View style={{ ...GS.centered, ...GS.row }}>
						<Ionicons
							size={CS.FONT_SIZE_XLG}
							color={CC.light}
							name='cut-sharp'
						/>
						<Text style={STYLES.availabilitiesItemTextLG}>1%</Text>
					</View>
				</View>

				<View style={STYLES.availabilitiesItem}>
					<Ionicons
						size={CS.FONT_SIZE_XLG}
						color={CC.light}
						name='flash'
					/>

					<Text style={STYLES.availabilitiesItemText}>
						Ready for takeaway
					</Text>
				</View>
			</View>

			<View style={{ ...STYLES.section, ...STYLES.header }}>
				<View style={STYLES.headerContent}>
					<Title style={STYLES.headerContentTitle}>
						{
							props?.data?.warehouseProduct?.product?.title[0]
								?.value
						}
					</Title>
					<Text style={STYLES.headerContentDescription}>
						{
							props?.data?.warehouseProduct?.product
								?.description[0]?.value
						}
					</Text>
				</View>

				<TouchableOpacity
					style={STYLES.headerAvatarContainer}
					onPress={onPressProfile}>
					<Avatar.Image
						size={AVATAR_WAREHOUSE_SIZE}
						source={{
							uri: props?.data?.warehouseLogo
								? props?.data?.warehouseLogo
								: 'https://media.istockphoto.com/vectors/flat-design-home-or-homepage-icon-vector-illustration-vector-id1134930193?k=20&m=1134930193&s=170667a&w=0&h=8b4ri9ib7s-Hz3Z6fnRWfygmf5Zb_UvA2PQJv4ukmic=',
						}}
					/>
				</TouchableOpacity>
			</View>

			<View style={{ ...STYLES.section, ...STYLES.footer }}>
				<Button
					uppercase={false}
					style={{ ...STYLES.footerBtn, ...STYLES.footerBuyBtn }}
					labelStyle={{
						...GS.FF_NunitoSemiBold,
						color: CC.light,
					}}>
					Buy for ${42}
				</Button>
				<Button
					uppercase={false}
					style={{ ...STYLES.footerBtn, ...STYLES.footerDetailBtn }}
					labelStyle={{
						...GS.FF_NunitoSemiBold,
						color: CC.light,
					}}>
					Details
				</Button>
			</View>
		</View>
	);
};

export default ProductItemSlide;
