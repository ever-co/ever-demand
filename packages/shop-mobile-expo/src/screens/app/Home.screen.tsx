import React from 'react';
import { View, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Title } from 'react-native-paper';
import { gql, useQuery } from '@apollo/client';

// SELECTORS
import { useAppSelector } from '../../store/hooks';
import { getLanguage } from '../../store/features/translation';

// COMPONENTS
import {
	FocusAwareStatusBar,
	CustomScreenHeader,
	ProductItem,
} from '../../components/Common';

// STYLES
import { GLOBAL_STYLE as GS } from '../../assets/ts/styles';

const PRODUCT_INFO_TEMPLATE = {
	initialPrice: 10,
	price: 11,
	deliveryTimeMin: 5,
	deliveryTimeMax: 10,
	count: 10,
	product: {
		title: 'Product name',
		description: 'Product description',
		images: [
			'https://media.istockphoto.com/photos/japanese-restaurant-sushi-dish-picture-id497022342?k=20&m=497022342&s=612x612&w=0&h=VkCoBfI4q67KiRfyIJ-bQx3S1EyjTfEWL2DtP9Ird-0=',
			'https://media.istockphoto.com/photos/chopstick-with-nigiri-sushi-piece-picture-id1053855542?k=20&m=1053855542&s=612x612&w=0&h=lU0-h01vg4dCrbh9ftIkuyAudi8texy7_gdAQKgLyjA=',
			'https://media.istockphoto.com/photos/close-up-of-sashimi-sushi-set-with-chopsticks-and-soy-picture-id521800854?k=20&m=521800854&s=612x612&w=0&h=Bzh6dyGUgbf_FFoyoz7vRrvZhz-kskvbdjB3cyssIbM=',
		],
	},
};

function HomeScreen({}) {
	// SELECTORS
	const LANGUAGE = useAppSelector(getLanguage);

	// QUERIES
	const PRODUCTS_QUERY = gql`
		query Products {
			getCountOfProducts
		}
	`;
	const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
		variables: {},
	});

	// STYLES
	const styles = StyleSheet.create({
		loaderContainer: { ...GS.centered, ...GS.w100, flex: 1 },
		productItemContainer: {
			...GS.mx1,
			...GS.mt2,
			...GS.mb1,
		},
	});

	// EFFECT
	React.useEffect(() => {
		console.log('Products ==>', data, loading, error);
	}, [data, loading, error]);

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<CustomScreenHeader
				title={LANGUAGE.PRODUCTS_VIEW.TITLE}
				showControls
			/>

			{loading ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator color={'#FFF'} size={25} />
				</View>
			) : data?.getCountOfProducts ? (
				<FlatList
					data={new Array(data?.getCountOfProducts || 0).fill(
						PRODUCT_INFO_TEMPLATE,
					)}
					renderItem={({ item, index }) => {
						return (
							<View style={styles.productItemContainer}>
								<ProductItem data={{ ...item, id: index }} />
							</View>
						);
					}}
					keyExtractor={(_item, _index) => _index.toString()}
					style={{ ...GS.h100 }}
				/>
			) : (
				<View style={{ ...GS.screen, ...GS.centered }}>
					<Title>Nothing to buy for now.</Title>
				</View>
			)}
		</View>
	);
}

export default HomeScreen;
