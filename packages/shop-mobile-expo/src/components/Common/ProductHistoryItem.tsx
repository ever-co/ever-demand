import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Text } from 'react-native-paper';

// COMPONENTS
import { PaperText, TouchableCard } from '.';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

export interface Props {
	image: string;
	title: string;
	description?: string;
	amount?: number;
	onPress: () => any;
}

const ProductHistoryItem: React.FC<Props> = ({
	image,
	title,
	description,
	amount = 0,
	onPress,
}) => {
	// DATA
	const PRODUCT_HEIGHT = CS.SPACE_XLG * 2;

	// STYLES
	const STYLES = StyleSheet.create({
		productCard: {
			...GS.noShadow,
			borderWidth: 0,
			overflow: 'hidden',
		},
		productCardContent: {
			...GS.px0,
		},
		productContentContainer: { ...GS.w100, ...GS.pr2, ...GS.inlineItems },
		productContentImageContainer: {
			overflow: 'hidden',
			borderTopEndRadius: CS.SPACE_SM,
			borderBottomEndRadius: CS.SPACE_SM,
		},
		productContentImage: {
			height: PRODUCT_HEIGHT,
			width: PRODUCT_HEIGHT,
		},
		productContent: {
			...GS.pl4,
			flex: 1,
		},
		productContentTitle: {
			...GS.txtPrimary,
			fontSize: CS.FONT_SIZE_MD + 1,
		},
		productContentDescription: {
			fontSize: CS.FONT_SIZE_MD,
			color: CC.gray,
		},
		productAmount: {
			...GS.centered,
			width: CS.FONT_SIZE_XLG * 2.5,
		},
		productAmountText: {
			...GS.txtPrimaryLight,
			...GS.FF_NunitoSemiBold,
		},
	});

	return (
		<TouchableCard
			onPress={onPress}
			height={PRODUCT_HEIGHT}
			cardStyle={STYLES.productCard}
			cardStyleContent={STYLES.productCardContent}
			rippleColor={CC.primary + '33'}>
			<View style={STYLES.productContentContainer}>
				<View style={STYLES.productContentImageContainer}>
					<Image
						resizeMode='cover'
						source={{
							uri: image,
						}}
						style={STYLES.productContentImage}
					/>
				</View>
				<View style={STYLES.productContent}>
					<Text style={STYLES.productContentTitle}>{title}</Text>
					{!!description && (
						<PaperText style={STYLES.productContentDescription}>
							{description}
						</PaperText>
					)}
				</View>

				<View style={STYLES.productAmount}>
					<PaperText style={STYLES.productAmountText}>
						${amount}
					</PaperText>
				</View>
			</View>
		</TouchableCard>
	);
};

export default ProductHistoryItem;
