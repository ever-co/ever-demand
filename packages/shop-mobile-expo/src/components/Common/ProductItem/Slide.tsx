/* eslint-disable max-len */
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Avatar, Title, Text, Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import Ionicons from '@expo/vector-icons/Ionicons';

// TYPES
import type { PropsItemInterface } from '.';

// COMPONENTS
import BuyProductBtn from '../../BuyProductBtn';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../../assets/ts/styles';

const ProductItemSlide: React.FC<PropsItemInterface> = (props) => {
	// DATA
	const AVATAR_WAREHOUSE_SIZE = CS.FONT_SIZE_XLG * 2.5;

	// LOCAL STYLES
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
			backgroundColor: CC.primaryLight,
		},
	});

	return (
		<View style={STYLES.container}>
			<Image
				style={STYLES.prodImg}
				source={{
					uri: props?.data.coverImage
						? props?.data.coverImage
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
						${props?.data?.price}
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
						{props?.data.title}
					</Title>
					<Text style={STYLES.headerContentDescription}>
						{props?.data?.description}
					</Text>
				</View>

				<TouchableOpacity
					style={STYLES.headerAvatarContainer}
					onPress={props.onPressProfile}>
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

export default ProductItemSlide;
