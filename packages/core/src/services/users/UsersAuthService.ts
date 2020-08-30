import IService from '../IService';
import User from '@modules/server.common/entities/User';
import { createEverLogger } from '../../helpers/Log';
import { EntityService } from '@pyro/db-server/entity-service';
import { asyncListener, routerName } from '@pyro/io';
import { UsersService } from './UsersService';
import { NotInvitedError } from '@modules/server.common/errors/NotInvitedError';
import { IUserCreateObject } from '@modules/server.common/interfaces/IUser';
import { InvitesService } from '../invites';
import IUserAuthRouter, {
	AddableRegistrationInfo,
	IUserLoginResponse,
	IUserRegistrationInput,
} from '@modules/server.common/routers/IUserAuthRouter';
import { inject, injectable } from 'inversify';
import { AuthService, AuthServiceFactory } from '../auth';
import { env } from '../../env';
import Logger from 'bunyan';

/**
 * Customers Authentication Service
 * TODO: rename "Users" to "Customers"
 *
 * @export
 * @class UsersAuthService
 * @extends {EntityService<User>}
 * @implements {IUserAuthRouter}
 * @implements {IService}
 */
@injectable()
@routerName('user-auth')
export class UsersAuthService extends EntityService<User>
	implements IUserAuthRouter, IService {
	readonly DBObject: any = User;

	// TODO: why it's not in the settings and hardcoded to some default value here?
	private static IS_INVITES_SYSTEM_ON: boolean = false;

	protected readonly log: Logger = createEverLogger({
		name: 'userAuthService',
	});

	private readonly authService: AuthService<User>;

	constructor(
		private readonly usersService: UsersService,
		private readonly invitesService: InvitesService,
		@inject('Factory<AuthService>')
		private readonly authServiceFactory: AuthServiceFactory
	) {
		super();

		this.authService = this.authServiceFactory({
			role: 'user',
			Entity: User,
			saltRounds: env.USER_PASSWORD_BCRYPT_SALT_ROUNDS,
		});
	}

	/**
	 * Register Customer.
	 * Throw NotInvitedError if customer not invited and invites system enabled
	 *
	 *
	 * @param {IUserRegistrationInput} input
	 * @returns {Promise<User>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async register(input: IUserRegistrationInput): Promise<User> {
		if (
			UsersAuthService.IS_INVITES_SYSTEM_ON &&
			!(await this._isInvited(input.user))
		) {
			throw new NotInvitedError();
		}

		if (input.user.firstName === '') {
			delete input.user.firstName;
		}

		if (input.user.lastName === '') {
			delete input.user.lastName;
		}

		if (input.user.email === '') {
			delete input.user.email;
		}

		const user = await this.usersService.create({
			...input.user,
			...(input.password
				? {
						hash: await this.authService.getPasswordHash(
							input.password
						),
				  }
				: {}),
		});

		return user;
	}

	/**
	 * Updates Customer password
	 *
	 * @param {User['id']} id
	 * @param {{ current: string; new: string }} password
	 * @returns {Promise<void>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async updatePassword(
		id: User['id'],
		password: { current: string; new: string }
	): Promise<void> {
		await this.usersService.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}

	/**
	 * Update exited Customer with given registration details (email, password, etc)
	 *
	 * @param {User['id']} id
	 * @param {AddableRegistrationInfo} {
	 * 			email,
	 * 			password,
	 * 			firstName,
	 * 			lastName,
	 * 			phone
	 * 		}
	 * @returns {Promise<void>}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async addRegistrationInfo(
		id: User['id'],
		{ email, password, firstName, lastName, phone }: AddableRegistrationInfo
	): Promise<void> {
		await this.usersService.throwIfNotExists(id);

		const user = await this.usersService.getCurrent(id);

		if (user.email == null && email) {
			throw new Error('To add password user must have email');
		}

		await this.authService.addPassword(id, password);

		await this.usersService.update(id, {
			...(email ? { email } : {}),
			...(firstName ? { firstName } : {}),
			...(lastName ? { lastName } : {}),
			...(phone ? { phone } : {}),
		});
	}

	/**
	 * Login Customer (returns user record and Auth token)
	 *
	 * @param {string} email
	 * @param {string} password
	 * @returns {(Promise<IUserLoginResponse | null>)}
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	async login(
		email: string,
		password: string
	): Promise<IUserLoginResponse | null> {
		const res = await this.authService.login({ email }, password);

		if (!res || res.entity.isDeleted) {
			return null;
		}

		return {
			user: res.entity,
			token: res.token,
		};
	}

	/**
	 * Get current Registration settings (e.g. registrationRequiredOnStart)
	 * TODO: make async
	 *
	 * @memberof UsersAuthService
	 */
	@asyncListener()
	getRegistrationsSettings(): Promise<{
		registrationRequiredOnStart: boolean;
	}> {
		return new Promise<{ registrationRequiredOnStart: boolean }>(
			(resolve, reject) => {
				resolve({
					registrationRequiredOnStart:
						env.SETTINGS_REGISTRATIONS_REQUIRED_ON_START,
				});
			}
		);
	}

	private async _isInvited(
		userCreateObject: IUserCreateObject
	): Promise<boolean> {
		const inviteFindObject = {
			'geoLocation.countryId': userCreateObject.geoLocation.countryId,
			'geoLocation.city': userCreateObject.geoLocation.city,
			'geoLocation.streetAddress':
				userCreateObject.geoLocation.streetAddress,
			'geoLocation.house': userCreateObject.geoLocation.house,
			apartment: userCreateObject.apartment,
		};

		if (userCreateObject.geoLocation.postcode) {
			inviteFindObject['geoLocation.postcode'] =
				userCreateObject.geoLocation.postcode;
		}

		const invite = await this.invitesService.findOne(inviteFindObject);

		return invite != null;
	}
}
