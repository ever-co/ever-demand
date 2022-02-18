import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const REGISTER_USER: TypedDocumentNode = gql`
	mutation Mutation($registerInput: UserRegisterInput!) {
		registerUser(registerInput: $registerInput) {
			firstName
			lastName
			id
		}
	}
`;
