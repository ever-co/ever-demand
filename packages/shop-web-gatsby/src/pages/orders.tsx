import React from 'react';
import { Button, Container, Grid, Typography } from '@mui/material';
import { useQuery } from '@apollo/client/react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import OrdersList, { ordersTotal } from '../components/OrdersList/OrdersList';
import { useAppContext } from '../Context';
import { GetOrders } from '../apollo/order';

/** The customer's orders and their total. */
const Orders = () => {
	const context = useAppContext();
	const userId = context.getUser().id;

	const { data, error, loading } = useQuery(GetOrders, {
		variables: { id: userId ?? '' },
		skip: !userId,
		fetchPolicy: 'network-only',
	});

	if (loading && !data) {
		return <Layout>Loading...</Layout>;
	}
	if (error) {
		return <Layout>Error! {error.message}</Layout>;
	}

	// The API list, else the orders placed in this visit (e.g. while the list loads)
	const orders = data?.getOrders ?? context.orders;
	const total = ordersTotal(orders);

	return (
		<Layout>
			<Container maxWidth={'xl'}>
				<Grid sx={{ justifyContent: 'center' }} container spacing={4}>
					<Grid size={{ xs: 12, lg: 'auto' }}>
						<Button variant={'contained'} color={'secondary'}>
							Pay Now: ${total}
						</Button>
						<br />
						<Typography variant={'body1'}> Or pay with cash </Typography>
					</Grid>

					<Grid size={{ xs: 12, lg: 8, xl: 10 }}>
						<OrdersList orders={orders} />
					</Grid>
				</Grid>
			</Container>
		</Layout>
	);
};

export const Head = () => <Seo title="Orders" />;

export default Orders;
