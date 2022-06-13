import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Query to retrieve merchants by name
 */
export const GET_MERCHANTS_QUERY: TypedDocumentNode = gql`
	query GetMerchantsBuyName(
		$searchName: String!
		$geoLocation: GeoLocationFindInput
	) {
		getMerchantsBuyName(
			searchName: $searchName
			geoLocation: $geoLocation
		) {
			id
			username
			name
			logo
			isActive
		}
	}
`;

export const GET_STORED_PRODUCT: TypedDocumentNode = gql`
	query GetStoreProducts($storeId: String!, $fullProducts: Boolean!) {
		getStoreProducts(storeId: $storeId, fullProducts: $fullProducts) {
			id
			price
			count
			isTakeaway
			isProductAvailable
			isDeliveryRequired
			isCarrierRequired
			isManufacturing
			soldCount
			product {
				id
				title {
					locale
					value
				}
				description {
					locale
					value
				}
				images {
					url
					locale
					width
					height
					orientation
				}
				_id
				descriptionHTML {
					locale
					value
				}
				_createdAt
				_updatedAt
				detailsHTML {
					value
					locale
				}
				categories
				details {
					value
					locale
				}
			}
			_id
			initialPrice
			deliveryTimeMin
			deliveryTimeMax
		}
		warehouse(id: $storeId) {
			name
			logo
			id
		}
	}
`;
