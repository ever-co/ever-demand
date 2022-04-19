/* eslint-disable max-len */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Avatar, Title } from 'react-native-paper';

// COMPONENTS
import { PaperText } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';
import ProductHistoryItem from './ProductHistoryItem';

const OrderHistoryItem = () => {
	// DATA

	const STYLES = StyleSheet.create({
		container: {
			...GS.shadow,
			overflow: 'hidden',
		},
		header: {
			...GS.inlineItems,
			...GS.p2,
		},
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
		headerContentTitle: {
			...GS.txtPrimaryLight,
			fontSize: CS.FONT_SIZE_MD,
		},
		headerContentDescription: {
			fontSize: CS.FONT_SIZE_MD,
			color: CC.gray,
		},
		headerAmount: {
			...GS.centered,
			width: CS.FONT_SIZE_XLG * 2.5,
		},
		headerAmountText: {
			...GS.txtPrimaryLight,
			...GS.FF_NunitoSemiBold,
		},
		separator: {
			...GS.w100,
			...GS.mt3,
			borderWidth: 0.5,
			borderColor: CC.primaryHightLight,
		},
	});

	return (
		<Card style={STYLES.container}>
			<View style={STYLES.header}>
				<View style={STYLES.headerAvatarContainer}>
					<Avatar.Image
						source={{
							uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8Uk1GaGARRuNQv504qGbwiprC197kYLM7Sg&usqp=CAU',
						}}
						size={CS.FONT_SIZE * 4}
					/>
				</View>

				<View style={STYLES.headerContent}>
					<PaperText style={STYLES.headerContentTitle}>
						Title
					</PaperText>
					<PaperText style={STYLES.headerContentDescription}>
						Description
					</PaperText>
				</View>

				<View style={STYLES.headerAmount}>
					<Title style={STYLES.headerAmountText}>$00</Title>
				</View>
			</View>
			<View style={STYLES.separator} />
			<View>
				<ProductHistoryItem image='' title={''} onPress={() => {}} />
			</View>
		</Card>
	);
};

export default OrderHistoryItem;
