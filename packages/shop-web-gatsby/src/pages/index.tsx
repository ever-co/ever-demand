import React, { useContext } from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import ProductGrid from '../components/ProductGrid';
import { AppContext } from '../Context';
import { GeoLocationProductsByPaging } from '../apollo/product';
import { useMutation, useQuery } from 'react-apollo-hooks';
import { createOrder } from '../apollo/order';
import { Container } from '@material-ui/core';
import { navigate } from '@reach/router';

const IndexPage = (props) => {
	const context = useContext(AppContext);

	const { data, error, loading } = (context.coordinates &&
		useQuery(GeoLocationProductsByPaging, {
			variables: {
				geoLocation: {
					loc: { type: 'Point', coordinates: context.coordinates },
				},
			},
			pollInterval: 500,
		})) || { loading: true };
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
		}).then((res) => {
			console.log(res);
			context.setOrders([...context.orders, res.data.createOrder]);
			navigate('/orders');
		});
	};
	if (loading) {
		return <div>Loading...</div>;
	}
	if (error) {
		// @ts-ignore
		return <div>Error! {error.message}</div>;
	}
	const gridProducts =
		data.geoLocationProductsByPaging && !context.deliveryOnly
			? data.geoLocationProductsByPaging
			: data.geoLocationProductsByPaging.filter((item) => !item.isTakeaway);
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
