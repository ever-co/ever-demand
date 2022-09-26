import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Avatar, Title } from 'react-native-paper';

// TYPES
import type { OrderProductsInterface } from '../../client/types';

// COMPONENTS
import { PaperText, ProductHistoryItem } from '../../components/Common';

// STYLES
import {
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
	CONSTANT_COLOR as CC,
} from '../../assets/ts/styles';

export interface OrderHistoryItemInterface {
	data: {
		warehouseLogo?: string;
		createdAt: Date;
		orderStatus: number;
		customerCity: string;
		customerStreetAddress: string;
		customerHouse?: string;
		products: OrderProductsInterface[];
	};
}

export interface PropsItemInterface {
	data: OrderHistoryItemInterface['data'];
}

const OrderHistoryItem: React.FC<OrderHistoryItemInterface> = (props) => {
	// DATA
	const { data } = props;

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
			fontSize: CS.FONT_SIZE_MD - 2,
		},
		headerContentDescription: {
			fontSize: CS.FONT_SIZE_SM,
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
		headerStatusText: {
			fontSize: CS.FONT_SIZE_SM,
		},
		wrapProductItem: {
			...GS.py1,
			...GS.pl1,
		},
	});

	const d = new Date(data.createdAt);
	// Format Creation Date
	const getFormattedTime = (str: string) => {
		const h = str.substring(0, 2);
		const min = str.substring(3, 5);
		if (parseInt(h, 10) > 12)
			return parseInt(h, 10) - 12 + ':' + min + ' PM';
		else return h + ':' + min + ' AM';
	};

	const formattedDate =
		d.toLocaleDateString() +
		', ' +
		getFormattedTime(d.toLocaleTimeString());

	// TOTAL PRICE
	const getTotalPrice = () => {
		let sum = 0;
		for (const iterator of data.products) {
			const productTotalPrice = iterator.price * iterator.count;
			sum += productTotalPrice;
		}

		return sum;
	};

	return (
		<Card style={STYLES.container}>
			<View style={STYLES.header}>
				<View style={STYLES.headerAvatarContainer}>
					<Avatar.Image
						source={{
							uri: data?.warehouseLogo
								? data?.warehouseLogo
								: 'https://media.istockphoto.com/vectors/flat-design-home-or-homepage-icon-vector-illustration-vector-id1134930193?k=20&m=1134930193&s=170667a&w=0&h=8b4ri9ib7s-Hz3Z6fnRWfygmf5Zb_UvA2PQJv4ukmic=',
						}}
						size={CS.FONT_SIZE * 4}
					/>
				</View>

				<View style={STYLES.headerContent}>
					<PaperText style={STYLES.headerContentTitle}>
						To:
						{data.customerStreetAddress +
							' ' +
							data.customerHouse +
							', ' +
							data.customerCity}
					</PaperText>
					<View style={GS.row}>
						<PaperText style={STYLES.headerContentDescription}>
							{formattedDate}
						</PaperText>
						<PaperText
							style={[
								STYLES.headerStatusText,
								data.orderStatus === 0
									? GS.txtDanger
									: GS.txtSuccess,
							]}>
							{' '}
							{data.orderStatus === 0 ? 'Failed' : 'Completed'}
						</PaperText>
					</View>
				</View>

				<View style={STYLES.headerAmount}>
					<Title style={STYLES.headerAmountText}>
						${getTotalPrice()}
					</Title>
				</View>
			</View>
			<View style={STYLES.separator} />
			<FlatList
				data={data.products as OrderProductsInterface[]}
				renderItem={({ item }) => (
					<View style={STYLES.wrapProductItem}>
						<ProductHistoryItem
							amount={item.price * item.count}
							image={item.product.images[0].url}
							description={item.product.description[0].value}
							count={item.count}
							title={item.product.title[0].value}
							onPress={() => {}}
						/>
					</View>
				)}
				keyExtractor={(_item, _index) => _index.toString()}
				overScrollMode='never'
				showsVerticalScrollIndicator={false}
			/>
		</Card>
	);
};

export default OrderHistoryItem;
