import React, { useContext } from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import ProductGrid from '../components/ProductGrid';
import { AppContext } from '../Context';
import { GeoLocationProductsByPaging } from '../apollo/product';
import { useMutation, useQuery } from 'react-apollo-hooks';
import { createOrder } from '../apollo/order';
import config from '../config';
import { Container } from '@material-ui/core';

const IndexPage = props => {
	const context = useContext(AppContext);
	let coordinates;
	// in dev mode load default coords
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
		coordinates = config.defaultCoordinates;
	} else {
		coordinates = context.coordinates;
	}

	const { data, error, loading } = useQuery(GeoLocationProductsByPaging, {
		variables: {
			geoLocation: { loc: { type: 'Point', coordinates: context.coordinates } },
		},
	});
	const placeOrder = useMutation(createOrder);

	const addToCart = (item: { warehouseProduct?: any; warehouseId?: any }) => {
		const { warehouseProduct } = item;
		const { product } = warehouseProduct;
		placeOrder({
			variables: {
				createInput: {
					userId: context.getUser().id,
					warehouseId: item.warehouseId,
					products: { productId: product.id, count: 1 },
				},
			},
		});
	};
	if (loading) {
		return <div>Loading...</div>;
	}
	if (error) {
		// @ts-ignore
		return <div>Error! {error.message}</div>;
	}
	const gridProducts = data.geoLocationProductsByPaging && !context.deliveryOnly ? data.geoLocationProductsByPaging:
		data.geoLocationProductsByPaging.filter(item => !item.isTakeaway)
	return (
		<Layout>
			<SEO title="Home" keywords={[`gatsby`, `application`, `react`, 'ever']} />
			<Container maxWidth={'xl'}>
				<ProductGrid
					geoLocationProductsByPaging={gridProducts}
					addToCart={addToCart}
				/>
			</Container>
		</Layout>
	);
};

export default IndexPage;
