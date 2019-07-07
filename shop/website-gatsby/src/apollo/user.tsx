import { gql } from 'apollo-boost';

export const CreateUser = gql`
	mutation makeUser($user: UserCreateInput!, $password: String!) {
		registerUser(registerInput: { user: $user, password: $password }) {
			id
		}
	}
`;
