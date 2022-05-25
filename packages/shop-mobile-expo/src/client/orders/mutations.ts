import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const CREATE_ORDER_MUTATION: TypedDocumentNode = gql`
	mutation CreateOrder($createInput: OrderCreateInput!) {
		createOrder(createInput: $createInput) {
			id
			user {
				id
				email
				firstName
				apartment
				image
			}
			warehouse {
				id
				logo
				name
				username
				ordersEmail
				ordersPhone
				inStoreMode
			}
			warehouseId
			carrier {
				id
				username
				phone
				logo
				email
				status
			}
			carrierId
			products {
				count
				isManufacturing
				isTakeaway
				isDeliveryRequired
				initialPrice
				price
				product {
					title {
						value
						locale
					}
					id
					description {
						value
						locale
					}
					_createdAt
					_updatedAt
				}
				comment
			}
			isConfirmed
			isCancelled
			isPaid
			isCompleted
			orderType
			totalPrice
			deliveryTime
			orderNumber
			carrierStatus
			warehouseStatus
			warehouseStatusText
			carrierStatusText
			deliveryTimeEstimate
			startDeliveryTime
			finishedProcessingTime
			status
			createdAt
			updatedAt
		}
	}
`;
