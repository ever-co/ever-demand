import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card } from '@material-ui/core';
//import { Test } from './Order.styles';
import styles from './Order.module.scss'

const Order = ({order}) => {
	const {product} = order.products[0]
	return(
		<Card className={styles.order}>
			{typeof order.products !== 'undefined' && <img src={product.images[0].url} />}
			<Box display={'inline'}>
			</Box>
		</Card>
)};

Order.propTypes = {
  // bla: PropTypes.string,
};

Order.defaultProps = {
  // bla: 'test',
};

export default Order;
