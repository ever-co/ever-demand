import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProductGrid.module.scss';
import { Grid } from '@material-ui/core';
import ProductCard from '../ProductCard';

/**
 * Grid view of products on index page.
 * @param geoLocationProducts
 */
const ProductGrid = ({ geoLocationProductsByPaging, addToCart }) => (
	<Grid container spacing={3}>
		{geoLocationProductsByPaging.map(
			(item: { warehouseProduct: { product: any } }) => {
				return (
					<Grid item xs={12} md={4} lg={3} xl={2}>
						<ProductCard item={item} addToCart={addToCart} />
					</Grid>
				);
			},
		)}
	</Grid>
);

ProductGrid.propTypes = {
	// bla: PropTypes.string,
};

ProductGrid.defaultProps = {
	// bla: 'test',
};

export default ProductGrid;
