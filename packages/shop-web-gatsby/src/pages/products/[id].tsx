import React from 'react';
import { useQuery } from '@apollo/client/react';
import type { PageProps } from 'gatsby';

import Layout from '../../components/layout';
import Seo from '../../components/seo';
import ProductDetails from '../../components/ProductDetails/ProductDetails';
import { ProductQuery } from '../../apollo/product';

/**
 * Product details, a client-only route (/products/:id). It used to be built per product
 * from the API at build time (gatsby-source-graphql); now the browser fetches the product,
 * so `gatsby build` needs no running API.
 */
const ProductPage = ({ params }: PageProps) => {
	const { data, error, loading } = useQuery(ProductQuery, {
		variables: { id: params.id },
		skip: !params.id,
	});

	if (loading && !data) {
		return <Layout>Loading...</Layout>;
	}
	if (error) {
		return <Layout>Error! {error.message}</Layout>;
	}
	if (!data?.product) {
		return <Layout>Product not found.</Layout>;
	}

	return (
		<Layout>
			<ProductDetails product={data.product} />
		</Layout>
	);
};

export const Head = () => <Seo title="Product" />;

export default ProductPage;
