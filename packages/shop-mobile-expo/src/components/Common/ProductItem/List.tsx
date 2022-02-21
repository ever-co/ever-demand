import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Avatar, Title, Text, Button } from 'react-native-paper';
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

const ProductItemList: React.FC<ProductItemType> = (props: ProductItemType) => {
	// LOCAL STYLES
	const styles = StyleSheet.create({
		container: {
			...GS.w100,
			...GS.rounded,
			backgroundColor: CC.primaryLight,
			position: 'relative',
			overflow: 'hidden',
		},
		section: {
			...GS.p2,
			...GS.inlineItems,
		},
		header: {},
		headerAvatarContainer: {
			...GS.shadow,
			...GS.mr5,
			borderRadius: 100,
			borderWidth: 2,
			borderColor: CC.light,
		},
		headerContent: {
			flex: 1,
		},
		headerContentTitle: { ...GS.fontBold, color: CC.light },
		headerContentDescription: {
			...GS.FF_NunitoBold,
			fontSize: CS.FONT_SIZE_MD,
			color: CC.grayLight,
		},
		headerAvailability: {
			...GS.centered,
			width: CS.FONT_SIZE_XLG * 2.5,
		},
		headerAvailabilityText: {
			...GS.FF_NunitoSemiBold,
			fontSize: CS.FONT_SIZE_SM,
			lineHeight: 12,
		},
		prodImg: {
			height: CS.SCREEN_HEIGHT / 3,
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
			backgroundColor: CC.dark + '88',
		},
	});

	return (
		<View style={styles.container}>
			<View style={{ ...styles.section, ...styles.header }}>
				<TouchableOpacity style={styles.headerAvatarContainer}>
					<Avatar.Image
						size={CS.FONT_SIZE_XLG * 2.2}
						source={{
							uri: props?.data?.warehouseLogo
								? props?.data?.warehouseLogo
								: 'https://media.istockphoto.com/vectors/flat-design-home-or-homepage-icon-vector-illustration-vector-id1134930193?k=20&m=1134930193&s=170667a&w=0&h=8b4ri9ib7s-Hz3Z6fnRWfygmf5Zb_UvA2PQJv4ukmic=',
						}}
					/>
				</TouchableOpacity>
				<View style={styles.headerContent}>
					<Title style={styles.headerContentTitle}>
						{
							props?.data?.warehouseProduct?.product?.title[0]
								?.value
						}
					</Title>
					<Text style={styles.headerContentDescription}>
						{
							props?.data?.warehouseProduct?.product
								?.description[0]?.value
						}
					</Text>
				</View>
				<View style={styles.headerAvailability}>
					<Ionicons
						size={CS.FONT_SIZE_XLG}
						color={CC.light}
						name='flash'
					/>

					<Text style={styles.headerAvailabilityText}>
						Ready for takeaway
					</Text>
				</View>
			</View>
			<Image
				style={styles.prodImg}
				source={{
					uri: props?.data?.warehouseProduct?.product?.images?.length
						? props?.data?.warehouseProduct?.product?.images[0].url
						: 'https://static.vecteezy.com/system/resources/previews/004/941/788/original/cardboard-boxes-or-packaging-paper-and-shipping-box-carton-parcels-and-delivery-packages-pile-flat-warehouse-goods-and-cargo-transportation-design-illustration-vector.jpg',
				}}
			/>
			<View style={{ ...styles.section, ...styles.footer }}>
				<Button
					uppercase={false}
					style={{ ...styles.footerBtn, ...styles.footerBuyBtn }}
					labelStyle={{
						...GS.FF_NunitoSemiBold,
						color: CC.light,
					}}>
					Buy for ${42}
				</Button>
				<Button
					uppercase={false}
					style={{ ...styles.footerBtn, ...styles.footerDetailBtn }}
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

export default ProductItemList;
