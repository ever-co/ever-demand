import { graphql, Link } from 'gatsby';
import React, { useContext } from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';

import styles from './home.module.scss';
import ProductGrid from '../components/ProductGrid';
import { AppContext } from '../Context';
import { GeoLocationProductsByPaging } from '../apollo/product';
import {useQuery, useMutation} from 'react-apollo-hooks'
import { createOrder } from '../apollo/order';

const IndexPage = (props) => {
  const context = useContext(AppContext);
	const { coords } = context;

	const { data, error, loading } = useQuery(GeoLocationProductsByPaging, {
		variables: {
			geoLocation: { loc: { type: 'Point', coordinates: coords } }
		}
  });
  const placeOrder = useMutation(createOrder);

	const addToCart = (item: { warehouseProduct?: any; warehouseId?: any; }) => {
		console.log(item);
		const {warehouseProduct } = item;
		const {product} = warehouseProduct;
		placeOrder({variables: {createInput: {userId: context.user.id, warehouseId: item.warehouseId, products: {productId: product.id, count: 1}}}});

	};
  return (
    <Layout>
      <SEO title='Home' keywords={[`gatsby`, `application`, `react`, 'ever']} />
      <section>
        <ProductGrid geoLocationProductsByPaging={data.geoLocationProductsByPaging} addToCart={addToCart} />

      </section>
    </Layout>
)};


export default IndexPage;
