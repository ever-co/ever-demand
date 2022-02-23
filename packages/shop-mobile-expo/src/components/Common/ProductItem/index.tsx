import React from 'react';
import { Text } from 'react-native';

// TYPES
import type ENV from '../../../environments/model';
import type { ProductInfoInterface } from '../../../client/products/argumentInterfaces';

// COMPONENTS
import ProductItemVertical from './List';
import ProductItemHorizontal from './Slide';

// LOCAL TYPES
export interface ProductItemType {
	data: ProductInfoInterface;
	type: ENV['PRODUCTS_VIEW_TYPE'];
}

const ProductItem: React.FC<ProductItemType> = (props) => {
	switch (props.type) {
		case 'list':
			return <ProductItemVertical data={props.data} />;
		case 'slides':
			return <ProductItemHorizontal data={props.data} />;
		default:
			return <Text>Type invalid</Text>;
	}
};

export default ProductItem;
