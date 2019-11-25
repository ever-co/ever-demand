import { gql } from 'apollo-boost';

export const createOrder = gql`
	mutation placeOrder($createInput: OrderCreateInput!) {
		createOrder(createInput: $createInput) {
			id
			updatedAt
			orderNumber
			status
			totalPrice
			products {
				isTakeaway
				product {
					images {
						url
					}
					description {
						locale
						value
					}
					details {
						locale
						value
					}
					title {
						locale
						value
					}
				}
				price
			}
			totalPrice
		}
	}
`;

export const getOrders = gql`
	query fetchOrders($id: String!) {
		getOrders(userId: $id) {
			id
			updatedAt
			orderNumber
			status
			totalPrice
			products {
				isTakeaway
				product {
					images {
						url
					}
					description {
						locale
						value
					}
					details {
						locale
						value
					}
					title {
						locale
						value
					}
				}
				price
			}
			totalPrice
		}
	}
`;
