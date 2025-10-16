import { gql } from 'apollo-angular';
import { OrderFragment } from '../../components/order-card/order/order.model';

export const OrdersHistoryQuery = gql`
	query OrdersHistoryPageQuery($userId: String!) {
		getOrders(userId: $userId) {
			...OrderFragment
		}
	}
	${OrderFragment}
`;
