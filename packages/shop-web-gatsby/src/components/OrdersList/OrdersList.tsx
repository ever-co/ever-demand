import React from 'react';
import PropTypes from 'prop-types';
import Order from '../Order/Order';
import { Container, Grid } from '@material-ui/core';
//import { Test } from './OrdersList.styles';

const OrdersList = ({ orders }) => (
	<Container>
		<Grid justify={'center'} spacing={4}>
			{orders.map((order) => (
				<Order order={order} />
			))}
		</Grid>
	</Container>
);

OrdersList.propTypes = {
	// bla: PropTypes.string,
};

OrdersList.defaultProps = {
	// bla: 'test',
};

export default OrdersList;
