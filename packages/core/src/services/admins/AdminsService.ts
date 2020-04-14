import { DBService } from '@pyro/db-server';
import Admin from '@modules/server.common/entities/Admin';
import { createEverLogger } from '../../helpers/Log';
import { AuthService, AuthServiceFactory } from '../auth';
import { env } from '../../env';
import IAdminRouter, {
	IAdminLoginResponse,
	IAdminRegistrationInput,
} from '@modules/server.common/routers/IAdminRouter';
import { Observable } from 'rxjs';
import { asyncListener, observableListener } from '@pyro/io';
import { inject, injectable } from 'inversify';
import { first, map, switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import Logger from 'bunyan';

// TODO: Rename! "Admin" is not a great name, but currently "Users" mean "Customers"...
/**
 * Users (not customers!) management service
 * In most cases such users are Administrators, which need to get access into Admin or Mechant app
 */
@injectable()
export class AdminsService extends DBService<Admin> implements IAdminRouter {
	readonly DBObject: any = Admin;

	protected readonly log: Logger = createEverLogger({ name: 'adminService' });

	private readonly authService: AuthService<Admin>;

	constructor(
		@inject('Factory<AuthService>')
		authServiceFactory: AuthServiceFactory,
		// TypeORM Repository - temporary here, will be moved into DBService later
		@inject('AdminRepository')
		private readonly _adminRepository: Repository<Admin>
	) {
		super();

		// TODO: move to base class (DBService) and make it fail everything if no admin users found in DB
		_adminRepository
			.count()
			.then((c) => {
				console.log('Admins count: ' + c);
			})
			.catch((e) => {
				console.log(e);
			});

		this.authService = authServiceFactory({
			role: 'admin',
			Entity: Admin,
			saltRounds: env.ADMIN_PASSWORD_BCRYPT_SALT_ROUNDS,
		});
	}

	@observableListener()
	get(id: Admin['id']): Observable<Admin | null> {
		return super.get(id).pipe(
			map(async (admin) => {
				await this.throwIfNotExists(id);
				return admin;
			}),
			switchMap((admin) => admin)
		);
	}

	@asyncListener()
	async getByEmail(email: Admin['email']): Promise<Admin | null> {
		return super.findOne({ email, isDeleted: { $eq: false } });
	}

	@asyncListener()
	async register(input: IAdminRegistrationInput): Promise<Admin> {
		const admin = await this.create({
			...input.admin,
			...(input.password
				? {
						hash: await this.authService.getPasswordHash(
							input.password
						),
				  }
				: {}),
		});

		return admin;
	}

	@asyncListener()
	async updatePassword(
		id: Admin['id'],
		password: { current: string; new: string }
	): Promise<void> {
		await this.throwIfNotExists(id);
		await this.authService.updatePassword(id, password);
	}

	@asyncListener()
	async login(
		email: string,
		password: string
	): Promise<IAdminLoginResponse | null> {
		let res = null;
		const admin = await this.getByEmail(email);

		if (admin) {
			res = await this.authService.login({ email }, password);
		}

		if (!res) {
			return null;
		}

		return {
			admin: res.entity,
			token: res.token,
		};
	}

	@asyncListener()
	async isAuthenticated(token: string): Promise<boolean> {
		return this.authService.isAuthenticated(token);
	}

	@asyncListener()
	async updateById(
		id: Admin['id'],
		updateObject: Partial<Admin>
	): Promise<Admin> {
		await this.throwIfNotExists(id);
		return super.update(id, updateObject);
	}

	async throwIfNotExists(adminId: string) {
		const admin = await super.get(adminId).pipe(first()).toPromise();

		if (!admin || admin.isDeleted) {
			throw Error(`Admin with id '${adminId}' does not exists!`);
		}
	}
}
