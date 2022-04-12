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
