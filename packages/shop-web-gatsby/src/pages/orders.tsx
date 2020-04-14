import React, { useContext } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { getOrders } from '../apollo/order';
import { Button, Container, Grid, Typography } from '@material-ui/core';
import { AppContext } from '../Context';
import Layout from '../components/layout';
import OrdersList from '../components/OrdersList/OrdersList';

const Orders = (props) => {
	const context = useContext(AppContext);
	// @ts-ignore
	const { data, error, loading } = useQuery(getOrders, {
		variables: { id: context.getUser().id },
	});

	if (context.orders === []) {
		if (loading) {
			return <div>Loading...</div>;
		}
		if (error) {
			// @ts-ignore
			return <div>Error! {error.message}</div>;
		}
		context.setOrders(data.getOrders);
	}
	console.log(context.orders);
	const orders = context.orders || [];
	const sum = (_total, order) => {
		return _total + order;
	};
	const totals = orders.map((order) => order.totalPrice);
	const total = totals.reduce(sum, 0);
	console.log(total);
	return (
		<Layout>
			<Container maxWidth={'xl'}>
				<Grid container justify={'center'} spacing={4}>
					<Grid item xs={12} lg={'auto'}>
						<Button variant={'contained'} color={'secondary'}>
							Pay Now: ${total}
						</Button>
						<br />
						<Typography variant={'body1'}> Or pay with cash </Typography>
					</Grid>

					<Grid item xs={12} lg={8} xl={10}>
						<OrdersList orders={orders} />
					</Grid>
				</Grid>
			</Container>
		</Layout>
	);
};

Orders.propTypes = {
	// bla: PropTypes.string,
};

Orders.defaultProps = {
	// bla: 'test',
};

export default Orders;
