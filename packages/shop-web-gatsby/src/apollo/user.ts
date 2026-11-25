import { gql } from '../gql';

export const CreateUser = gql(`
	mutation MakeUser($user: UserCreateInput!, $password: String!) {
		registerUser(registerInput: { user: $user, password: $password }) {
			id
		}
	}
`);
