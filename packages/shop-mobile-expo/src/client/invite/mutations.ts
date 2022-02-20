import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const CREATE_INVITE_BY_LOCATION_MUTATION: TypedDocumentNode = gql`
	mutation CreateInviteByLocationMutation($createInput: InviteCreateInput!) {
		createInvite(createInput: $createInput) {
			id
			code
			apartment
			geoLocation {
				id
				createdAt
				updatedAt
				countryId
				countryName
				city
				streetAddress
				house
				postcode
				notes
				coordinates {
					lng
					lat
				}
			}
		}
	}
`;
