import React from 'react';
import { Container } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { navigate } from 'gatsby';

import Layout from '../components/layout';
import Seo from '../components/seo';
import ProductGrid from '../components/ProductGrid';
import type { ProductInfo } from '../components/ProductCard/ProductCard';
import { useAppContext } from '../Context';
import { GeoLocationProductsByPaging } from '../apollo/product';
import { CreateOrder } from '../apollo/order';

/**
 * Products: the products around the visitor (refreshed every 2 s like the Angular shop),
 * "buy" places an order and opens the orders page.
 */
const IndexPage = () => {
	const context = useAppContext();
	const coordinates = context.coordinates;

	const { data, error, loading } = useQuery(GeoLocationProductsByPaging, {
		variables: {
			geoLocation: {
				// GeoJSON order: longitude, latitude
				loc: {
					type: 'Point',
					coordinates: coordinates ? [coordinates[1], coordinates[0]] : [],
				},
			},
		},
		skip: !coordinates,
		pollInterval: 2000,
	});
	const [placeOrder] = useMutation(CreateOrder);

	const addToCart = async (item: ProductInfo) => {
		const { warehouseProduct } = item;
		const res = await placeOrder({
			variables: {
				createInput: {
					userId: context.getUser().id ?? '',
					warehouseId: item.warehouseId,
					products: [{ productId: warehouseProduct.product.id, count: 1 }],
				},
			},
		});
		if (res.data) {
			context.setOrders([...context.orders, res.data.createOrder]);
			navigate('/orders');
		}
	};

	if (!coordinates || (loading && !data)) {
		return <Layout>Loading...</Layout>;
	}
	if (error) {
		return <Layout>Error! {error.message}</Layout>;
	}

	const products = data?.geoLocationProductsByPaging ?? [];
	const gridProducts = context.deliveryOnly
		? products.filter((item) => item.warehouseProduct.isDeliveryRequired)
		: products;

	return (
		<Layout>
			<Container maxWidth={'xl'}>
				<ProductGrid
					geoLocationProductsByPaging={gridProducts}
					addToCart={addToCart}
				/>
			</Container>
		</Layout>
	);
};

export const Head = () => (
	<Seo title="Home" keywords={['ever', 'shop', 'delivery']} />
);

export default IndexPage;
