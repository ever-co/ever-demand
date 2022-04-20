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
export interface ProductItemType {
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

const ProductItem: React.FC<ProductItemType> = (props) => {
	// NAVIGATION
	const NAVIGATION = useNavigation();

	// DATA
	const ROUTE_WAREHOUSE_ID = {
		warehouseId: props?.data.warehouseId,
	};

	// FUNCTIONS
	const onPressProfile = () => {
		if (!isEmpty(ROUTE_WAREHOUSE_ID.warehouseId)) {
			NAVIGATION.navigate(
				'DRAWER/IN_STORE' as never,
				ROUTE_WAREHOUSE_ID as never,
			);
		}
	};

	switch (props.type) {
		case 'list':
			return (
				<ProductItemVertical
					{...{ data: props.data, onPressProfile }}
				/>
			);
		case 'slides':
			return (
				<ProductItemHorizontal
					{...{ data: props.data, onPressProfile }}
				/>
			);
		default:
			return <Text>Type invalid</Text>;
	}
};

export default ProductItem;
