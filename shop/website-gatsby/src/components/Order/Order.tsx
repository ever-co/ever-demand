import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography, Grid } from '@material-ui/core';
import styles from './Order.module.scss';
import { matchLocale } from '../../utilities/utilities';

const Order = ({ order }) => {
	const { product } = order.products[0];
	console.log(order);
	return (
		<Card className={styles.order}>
			<Grid container justify={'space-between'} className={styles.cardContent}>
				<Grid item xs={6}>
					<Typography variant={'h4'}>{matchLocale(product.title)}</Typography>
					<Typography variant={'subtitle1'}>
						{product.description[0].value}
					</Typography>
				</Grid>

				<Grid item xs={4} className={styles.orderDetails}>
					<Typography variant={'caption'}>
						Order #: {order.orderNumber}
					</Typography>
					<br />
					<Typography variant={'caption'}>{order.updatedAt}</Typography>
					<br />
					<Typography variant={'caption'}>status: {order.status}</Typography>
				</Grid>

				<Grid item xs={2}>
					{typeof order.products !== 'undefined' && (
						<img src={product.images[0].url} />
					)}
				</Grid>
			</Grid>
		</Card>
	);
};

Order.propTypes = {
	// bla: PropTypes.string,
};

Order.defaultProps = {
	// bla: 'test',
};

export default Order;
