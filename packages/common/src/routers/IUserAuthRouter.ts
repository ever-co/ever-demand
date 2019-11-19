import User from '../entities/User';
import { CreateObject } from '@pyro/db/db-create-object';

export interface AddableRegistrationInfo {
	email?: string;
	password: string;

	firstName?: string;
	lastName?: string;
	phone?: string;
}

export interface IUserRegistrationInput {
	user: CreateObject<User>;
	password?: string;
}

export interface IUserLoginResponse {
	user: User;
	token: string;
}

interface IUserAuthRouter {
	/**
	 * Register Customer with given details
	 * Note: if invites system is on, it throws NotInvited if customer not invited
	 *
	 * @param {IUserRegistrationInput} input
	 * @returns {Promise<User>}
	 * @memberof IUserAuthRouter
	 */
	register(input: IUserRegistrationInput): Promise<User>;

	login(
		username: string,
		password: string
	): Promise<IUserLoginResponse | null>;

	addRegistrationInfo(
		id: User['id'],
		info: AddableRegistrationInfo
	): Promise<void>;

	updatePassword(
		id: User['id'],
		password: { current: string; new: string }
	): Promise<void>;

	getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}>;
}

export default IUserAuthRouter;
