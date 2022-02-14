import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Avatar, Title, Button } from 'react-native-paper';
// tslint:disable-next-line: no-implicit-dependencies no-submodule-imports
import Ionicons from '@expo/vector-icons/Ionicons';

// COMPONENTS
import { PaperText } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

export type ProductItemType = any;

const ProductItem = (props: ProductItemType) => {
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
							uri: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fHN1c2hpfGVufDB8fDB8fA%3D%3D&w=1000&q=80',
						}}
					/>
				</TouchableOpacity>
				<View style={styles.headerContent}>
					<Title style={styles.headerContentTitle}>
						{props.data?.product?.title}
					</Title>
					<PaperText style={styles.headerContentDescription}>
						{props.data?.product?.description}
					</PaperText>
				</View>
				<View style={styles.headerAvailability}>
					<Ionicons
						size={CS.FONT_SIZE_XLG}
						color={CC.light}
						name='flash'
					/>

					<PaperText style={styles.headerAvailabilityText}>
						Ready for takeaway
					</PaperText>
				</View>
			</View>
			<Image
				style={styles.prodImg}
				source={{ uri: props.data?.product?.images[0] }}
			/>
			<View style={{ ...styles.section, ...styles.footer }}>
				<Button
					uppercase={false}
					style={{ ...styles.footerBtn, ...styles.footerBuyBtn }}
					labelStyle={{
						...GS.FF_NunitoSemiBold,
						color: CC.light,
					}}>
					Buy for $42
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

export default ProductItem;
