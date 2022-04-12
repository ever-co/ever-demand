import { gql, TypedDocumentNode } from '@apollo/client';

export const ORDER_PRODUCT_FRAGMENT: TypedDocumentNode = gql`
	fragment OrderProductFragment on OrderProduct {
		count
		price
		isTakeaway
		product {
			images {
				locale
				orientation
				url
			}
			title {
				locale
				value
			}
			description {
				locale
				value
			}
		}
	}
`;

export const ORDER_FRAGMENT: TypedDocumentNode = gql`
	fragment OrderFragment on Order {
		id
		deliveryTime
		warehouseId
		deliveryTime
		createdAt
		status
		user {
			id
			geoLocation {
				countryName
				countryId
				streetAddress
				house
				postcode
				house
				city
			}
		}
		warehouse {
			id
			logo
		}
		products {
			...OrderProductFragment
		}
	}
	${ORDER_PRODUCT_FRAGMENT}
`;

/**
 * Query to retrieve order history by name
 */
export const GET_ORDER_HISTORY_QUERY: TypedDocumentNode = gql`
	query OrdersHistoryPageQuery($userId: String!) {
		getOrders(userId: $userId) {
			...OrderFragment
		}
	}
	${ORDER_FRAGMENT}
`;
