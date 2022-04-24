import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * Mutation to add a new user
 *
 * @type TypedDocumentNode
 */
export const REGISTER_USER_MUTATION: TypedDocumentNode = gql`
	mutation RegisterUserMutation($registerInput: UserRegisterInput!) {
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
			geoLocation {
				city
				countryName
				streetAddress
				house
			}
		}
	}
`;

export const USER_LOGIN: TypedDocumentNode = gql`
	mutation UserLogin($password: String!, $email: String!) {
		userLogin(password: $password, email: $email) {
			user {
				id
				geoLocation {
					createdAt
				}
				apartment
				firstName
				lastName
				email
				phone
				devicesIds
				devices {
					language
					uuid
					type
					channelId
					id
				}
				image
				fullAddress
				createdAt
				isBanned
			}
			token
		}
	}
`;
