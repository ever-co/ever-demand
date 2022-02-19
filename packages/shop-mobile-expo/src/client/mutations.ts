import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const REGISTER_USER: TypedDocumentNode = gql`
	mutation RegisterUser($registerInput: UserRegisterInput!) {
		registerUser(registerInput: $registerInput) {
			firstName
			lastName
			phone
			id
			apartment
			image
			createdAt
			fullAddress
			email
		}
	}
`;
