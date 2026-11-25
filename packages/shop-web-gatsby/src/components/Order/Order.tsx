import React from 'react';
import { Card, Grid, Typography } from '@mui/material';
import * as styles from './Order.module.scss';
import { matchLocale } from '../../utilities/locale';
import type { FetchOrdersQuery } from '../../gql/graphql';

export type ShopOrder = FetchOrdersQuery['getOrders'][number];

/** One order: its first product, the number, the date and the status. */
const Order = ({ order }: { order: ShopOrder }) => {
	const product = order.products[0]?.product;

	return (
		<Card className={styles.order}>
			<Grid
				sx={{ justifyContent: 'space-between' }}
				container
				className={styles.cardContent}
			>
				<Grid size={6}>
					<Typography variant={'h4'}>{matchLocale(product?.title)}</Typography>
					<Typography variant={'subtitle1'}>
						{matchLocale(product?.description)}
					</Typography>
				</Grid>

				<Grid size={4} className={styles.orderDetails}>
					<Typography variant={'caption'}>
						Order #: {order.orderNumber}
					</Typography>
					<br />
					<Typography variant={'caption'}>{order.updatedAt}</Typography>
					<br />
					<Typography variant={'caption'}>status: {order.status}</Typography>
				</Grid>

				<Grid size={2}>
					{product?.images[0] && (
						<img src={product.images[0].url} alt={matchLocale(product.title)} />
					)}
				</Grid>
			</Grid>
		</Card>
	);
};

export default Order;
