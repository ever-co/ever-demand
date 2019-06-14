import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import styles from './orders.module.scss'
import { useQuery } from 'react-apollo-hooks';
import { getOrders } from '../apollo/order';
import { Card } from '@material-ui/core';
import { AppContext } from '../Context';
import Layout from '../components/layout';
import OrdersList from '../components/OrdersList/OrdersList';


const Orders = (props) => {
	const context = useContext(AppContext)
	// @ts-ignore
	const { data, error, loading } = useQuery(getOrders, {variables:{id: context.getUser().id}})
	console.log(data)
	const orders = data.getOrders;

	if (loading) {
		return <div>Loading...</div>;
	}
	if (error) {
		// @ts-ignore
		return <div>Error! {error.message}</div>;
	}
	return (
		<Layout>
			hi
			<OrdersList orders={orders}/>
		</Layout>
	)
};

Orders.propTypes = {
	// bla: PropTypes.string,
};

Orders.defaultProps = {
	// bla: 'test',
};

export default Orders;
