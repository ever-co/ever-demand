import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const REGISTER_USER_MUTATION: TypedDocumentNode = gql`
	mutation CreateInviteMutation($createInput: InviteCreateInput!) {
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
