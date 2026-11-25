import { gql } from '../gql';

export const CreateOrder = gql(`
	mutation PlaceOrder($createInput: OrderCreateInput!) {
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
		}
	}
`);

export const GetOrders = gql(`
	query FetchOrders($id: String!) {
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
		}
	}
`);
