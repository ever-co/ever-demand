import React from 'react';
import { Grid } from '@mui/material';
import ProductCard, { type ProductInfo } from '../ProductCard/ProductCard';

interface ProductGridProps {
	geoLocationProductsByPaging: readonly ProductInfo[];
	addToCart: (item: ProductInfo) => void;
}

/** Grid view of the products of the home page. */
const ProductGrid = ({
	geoLocationProductsByPaging,
	addToCart,
}: ProductGridProps) => (
	<Grid container spacing={3}>
		{geoLocationProductsByPaging.map((item) => (
			<Grid
				key={`${item.warehouseId}-${item.warehouseProduct.id}`}
				size={{ xs: 12, md: 4, lg: 3, xl: 2 }}
			>
				<ProductCard item={item} addToCart={addToCart} />
			</Grid>
		))}
	</Grid>
);

export default ProductGrid;
