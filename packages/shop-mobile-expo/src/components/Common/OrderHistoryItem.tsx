import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Card, Avatar, Title } from 'react-native-paper';

// COMPONENTS
import { PaperText, TouchableCard } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

const OrderHistoryItem = () => {
	// DATA
	const PRODUCT_HEIGHT = CS.SPACE_XLG * 2;

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
		productCard: {
			...GS.noShadow,
			borderWidth: 0,
			borderRadius: 0,
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
		productContentTitle: { ...GS.txtPrimary },
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
				<TouchableCard
					onPress={() => {}}
					height={PRODUCT_HEIGHT}
					cardStyle={STYLES.productCard}
					cardStyleContent={STYLES.productCardContent}
					rippleColor={CC.primary + '33'}>
					<View style={STYLES.productContentContainer}>
						<View style={STYLES.productContentImageContainer}>
							<Image
								resizeMode='cover'
								source={{
									uri: 'https://worthstart.com/wp-content/uploads/2021/07/Fast-Food-Restaurant-Names-Ideas-1200x800.jpg',
								}}
								style={STYLES.productContentImage}
							/>
						</View>
						<View style={STYLES.productContent}>
							<Title style={STYLES.productContentTitle}>
								Product title
							</Title>
							<PaperText style={STYLES.productContentDescription}>
								Product description
							</PaperText>
						</View>

						<View style={STYLES.productAmount}>
							<PaperText style={STYLES.productAmountText}>
								$00
							</PaperText>
						</View>
					</View>
				</TouchableCard>

				<TouchableCard
					onPress={() => {}}
					height={PRODUCT_HEIGHT}
					cardStyle={STYLES.productCard}
					cardStyleContent={STYLES.productCardContent}
					rippleColor={CC.primary + '33'}>
					<View style={STYLES.productContentContainer}>
						<View style={STYLES.productContentImageContainer}>
							<Image
								resizeMode='cover'
								source={{
									uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX5N1ZkNQVLEQCAe3hnOwr6OmZCsHRjF0Lwg&usqp=CAU',
								}}
								style={STYLES.productContentImage}
							/>
						</View>
						<View style={STYLES.productContent}>
							<Title style={STYLES.productContentTitle}>
								Product title
							</Title>
							<PaperText style={STYLES.productContentDescription}>
								Product description
							</PaperText>
						</View>

						<View style={STYLES.productAmount}>
							<PaperText style={STYLES.productAmountText}>
								$00
							</PaperText>
						</View>
					</View>
				</TouchableCard>
			</View>
		</Card>
	);
};

export default OrderHistoryItem;
