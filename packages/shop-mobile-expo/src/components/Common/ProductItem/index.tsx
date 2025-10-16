import React from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TYPES
import type ENV from '../../../environments/model';

// HELPERS
import { isEmpty } from '../../../helpers/utils';

// COMPONENTS
import ProductItemVertical from './List';
import ProductItemHorizontal from './Slide';

// LOCAL TYPES
export interface ProductItemInterface {
	data: {
		warehouseId: string;
		warehouseLogo?: string;
		productId: string;
		title: string;
		description: string;
		price: number;
		coverImage?: string;
	};
	type: ENV['PRODUCTS_VIEW_TYPE'];
}

export interface PropsItemInterface {
	data: ProductItemInterface['data'];
	onPressProfile: () => any;
	onPressDetails: () => any;
}

const ProductItem: React.FC<ProductItemInterface> = (props) => {
	// NAVIGATION
	const NAVIGATION = useNavigation();

	// FUNCTIONS
	const onPressProfile = () => {
		const ROUTE_WAREHOUSE_ID = {
			warehouseId: props?.data.warehouseId,
		};

		if (!isEmpty(ROUTE_WAREHOUSE_ID.warehouseId)) {
			NAVIGATION.navigate(
				'DRAWER/IN_STORE' as never,
				ROUTE_WAREHOUSE_ID as never,
			);
		}
	};

	const onPressDetails = () => {
		const ROUTE_PRODUCT = {
			productId: props?.data.productId,
			warehouseId: props?.data.warehouseId,
		};

		if (!isEmpty(ROUTE_PRODUCT.productId)) {
			NAVIGATION.navigate(
				'DRAWER/PRODUCT_DETAILS' as never,
				ROUTE_PRODUCT as never,
			);
		}
	};

	switch (props.type) {
		case 'list':
			return (
				<ProductItemVertical
					{...{
						data: props.data,
						onPressProfile,
						onPressDetails,
					}}
				/>
			);
		case 'slides':
			return (
				<ProductItemHorizontal
					{...{
						data: props.data,
						onPressProfile,
						onPressDetails,
					}}
				/>
			);
		default:
			return <Text>Type invalid</Text>;
	}
};

export default ProductItem;
