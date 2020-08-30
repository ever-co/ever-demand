import { Router, RouterFactory } from '../lib/router';
import { Injectable } from '@angular/core';
import IUserAuthRouter, {
	AddableRegistrationInfo,
	IUserRegistrationInput,
	IUserLoginResponse,
} from '@modules/server.common/routers/IUserAuthRouter';
import User from '@modules/server.common/entities/User';
import IUser from '@modules/server.common/interfaces/IUser';

@Injectable()
export class UserAuthRouter implements IUserAuthRouter {
	private readonly router: Router;

	constructor(routerFactory: RouterFactory) {
		this.router = routerFactory.create('user-auth');
	}

	/**
	 * Register Customer
	 * Note: if invites system is on - throws NotInvited if not invited
	 *
	 * @param {IUserRegistrationInput} input
	 * @returns {Promise<User>}
	 * @memberof UserAuthRouter
	 */
	async register(input: IUserRegistrationInput): Promise<User> {
		const u = await this.router.run<IUser>('register', input);
		return this._userFactory(u);
	}

	async addRegistrationInfo(
		id: User['id'],
		info: AddableRegistrationInfo
	): Promise<void> {
		await this.router.run('addRegistrationInfo', id, info);
	}

	async login(
		username: string,
		password: string
	): Promise<IUserLoginResponse | null> {
		const res = await this.router.run<IUserLoginResponse>(
			'login',
			username,
			password
		);

		if (res == null) {
			return null;
		} else {
			return {
				token: res.token,
				user: this._userFactory(res.user),
			};
		}
	}

	async updatePassword(
		id: string,
		password: { current: string; new: string }
	): Promise<void> {
		await this.router.run('updatePassword', id, password);
	}

	protected _userFactory(user: IUser) {
		return user == null ? null : new User(user);
	}

	getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}> {
		return this.router.run<{ registrationRequiredOnStart: boolean }>(
			'getRegistrationsSettings'
		);
	}
}
