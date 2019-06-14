import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styles from './orders.module.scss';
import { useQuery } from 'react-apollo-hooks';
import { getOrders } from '../apollo/order';
import { Button, Card, Container, Grid, Typography } from '@material-ui/core';
import { AppContext } from '../Context';
import Layout from '../components/layout';
import OrdersList from '../components/OrdersList/OrdersList';
import { navigate } from 'gatsby';

const Orders = props => {
	const context = useContext(AppContext);
	// @ts-ignore
	const { data, error, loading } = useQuery(getOrders, {
		variables: { id: context.getUser().id },
	});
	const orders = data.getOrders;

	if (loading) {
		return <div>Loading...</div>;
	}
	if (error) {
		// @ts-ignore
		return <div>Error! {error.message}</div>;
	}
	const sum = (_total, order) => {
		return _total + order;
	};
	const totals = orders.map(order => order.totalPrice);
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
