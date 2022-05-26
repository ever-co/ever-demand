/* eslint-disable max-len */
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Avatar, Title, Text, Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import Ionicons from '@expo/vector-icons/Ionicons';

// TYPES
import type { PropsItemInterface } from './index';

// COMPONENTS
import BuyProductBtn from '../../BuyProductBtn';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../../assets/ts/styles';

const ProductItemList: React.FC<PropsItemInterface> = (props) => {
	// LOCAL STYLES
	const STYLES = StyleSheet.create({
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
			minWidth: CS.FONT_SIZE_XLG * 6,
		},
		footerBtnLabel: {
			...GS.FF_NunitoSemiBold,
			...GS.py1,
			color: CC.light,
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
		<View style={STYLES.container}>
			<View style={{ ...STYLES.section, ...STYLES.header }}>
				<TouchableOpacity
					style={STYLES.headerAvatarContainer}
					onPress={props?.onPressProfile}>
					<Avatar.Image
						size={CS.FONT_SIZE_XLG * 2.2}
						source={{
							uri: props?.data?.warehouseLogo
								? props?.data?.warehouseLogo
								: 'https://media.istockphoto.com/vectors/flat-design-home-or-homepage-icon-vector-illustration-vector-id1134930193?k=20&m=1134930193&s=170667a&w=0&h=8b4ri9ib7s-Hz3Z6fnRWfygmf5Zb_UvA2PQJv4ukmic=',
						}}
					/>
				</TouchableOpacity>
				<View style={STYLES.headerContent}>
					<Title style={STYLES.headerContentTitle}>
						{props?.data.title}
					</Title>
					<Text style={STYLES.headerContentDescription}>
						{props?.data.description}
					</Text>
				</View>
				<View style={STYLES.headerAvailability}>
					<Ionicons
						size={CS.FONT_SIZE_XLG}
						color={CC.light}
						name='flash'
					/>

					<Text style={STYLES.headerAvailabilityText}>
						Ready for takeaway
					</Text>
				</View>
			</View>
			<Image
				style={STYLES.prodImg}
				source={{
					uri: props?.data?.coverImage
						? props?.data?.coverImage
						: 'https://static.vecteezy.com/system/resources/previews/004/941/788/original/cardboard-boxes-or-packaging-paper-and-shipping-box-carton-parcels-and-delivery-packages-pile-flat-warehouse-goods-and-cargo-transportation-design-illustration-vector.jpg',
				}}
			/>
			<View style={{ ...STYLES.section, ...STYLES.footer }}>
				<BuyProductBtn
					amount={props?.data.price}
					productId={props?.data.productId}
					warehouseId={props?.data.warehouseId}
					buttonProps={{
						uppercase: false,
						style: { ...STYLES.footerBtn, ...STYLES.footerBuyBtn },
						labelStyle: STYLES.footerBtnLabel,
					}}
				/>

				<Button
					uppercase={false}
					style={{ ...STYLES.footerBtn, ...STYLES.footerDetailBtn }}
					labelStyle={STYLES.footerBtnLabel}
					onPress={props.onPressDetails}>
					Details
				</Button>
			</View>
		</View>
	);
};

export default ProductItemList;
