import gql from 'graphql-tag';
import { OrderFragment } from '../../../components/order/order.model';

export const OrderDetailsQuery = gql`
	query OrderDetailsPageQuery($id: String!) {
		getOrder(id: $id) {
			...OrderFragment
		}
	}
	${OrderFragment}
`;
