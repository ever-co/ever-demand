import React from 'react';
import { Container, Stack } from '@mui/material';
import Order, { type ShopOrder } from '../Order/Order';

/** The customer's orders, newest last (as the API returns them). */
const OrdersList = ({ orders }: { orders: readonly ShopOrder[] }) => (
	<Container>
		<Stack spacing={4}>
			{orders.map((order) => (
				<Order key={order.id} order={order} />
			))}
		</Stack>
	</Container>
);

/** Total price of the orders, for the "Pay now" button. */
export const ordersTotal = (orders: readonly { totalPrice: number }[]) =>
	orders.reduce((total, order) => total + order.totalPrice, 0);

export default OrdersList;
