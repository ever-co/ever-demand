import { DBService } from '@pyro/db-server';
import { assertCanAdd } from '../../tenant/plan-limits';
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
import { TenantScopedRepository } from '../../tenant/tenant-repository';
import Logger from 'bunyan';
import { stripProtectedFields } from '../stripProtectedFields';
import { TenantContext } from '../../tenant/tenant-context';
import type { TenantRole } from '@modules/server.common/interfaces/ITenant';

// TODO: Rename! "Admin" is not a great name, but currently "Users" mean "Customers"...
/**
 * Users (not customers!) management service
 * In most cases such users are Administrators, which need to get access into Admin or Mechant app
 */
@injectable()
export class AdminsService extends DBService<Admin> implements IAdminRouter {
	readonly DBObject: any = Admin;

	/** New admins count against the tenant's plan (members, tenant/plan-limits.ts). */
	protected async beforeCreate(): Promise<void> {
		await assertCanAdd('member');
	}

	protected readonly log: Logger = createEverLogger({ name: 'adminService' });

	private readonly authService: AuthService<Admin>;

	constructor(
		@inject('Factory<AuthService>')
		authServiceFactory: AuthServiceFactory,
		// TypeORM Repository - temporary here, will be moved into DBService later
		@inject('AdminRepository')
		private readonly _adminRepository: TenantScopedRepository<Admin>
	) {
		super();

		// TODO: move to base class (DBService) and make it fail everything if no admin users found in DB
		TenantContext.runAsSystem('log the number of admins at startup', () =>
			_adminRepository.count(),
		)
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

	/**
	 * Creates an admin in the current tenant. `input` may ask for role admin
	 * or staff; owner and super-admin are only given by the server itself
	 * (`grant`: tenant signup, first-admin bootstrap).
	 */
	@asyncListener()
	async register(
		input: IAdminRegistrationInput,
		grant?: { role?: TenantRole; isSuperAdmin?: boolean }
	): Promise<Admin> {
		const {
			role: requestedRole,
			isSuperAdmin: _ignoredSuperAdmin,
			tenantId: _ignoredTenantId,
			...fields
		} = (input.admin ?? {}) as any;

		const email = String(fields.email ?? '').trim().toLowerCase();

		// admin emails are unique across tenants (login needs no tenant)
		const taken = await TenantContext.runAsSystem(
			'admin emails are unique across tenants',
			() => this.Model.countDocuments({ email }).exec()
		);

		if (taken > 0) {
			throw new Error(`An admin with the email '${email}' already exists`);
		}

		const role: TenantRole =
			grant?.role ??
			(requestedRole === 'staff' || requestedRole === 'admin'
				? requestedRole
				: 'admin');

		const admin = await this.create({
			...fields,
			email,
			role,
			isSuperAdmin: grant?.isSuperAdmin === true,
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
		// looked up across tenants: the token then carries the admin's tenant
		const res = await this.authService.login(
			{
				email: String(email ?? '')
					.trim()
					.toLowerCase(),
			},
			password,
		);

		if (!res || res.entity.isDeleted) {
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
		return super.update(id, stripProtectedFields(updateObject));
	}

	async throwIfNotExists(adminId: string) {
		const admin = await super.get(adminId).pipe(first()).toPromise();

		if (!admin || admin.isDeleted) {
			throw Error(`Admin with id '${adminId}' does not exists!`);
		}
	}
}
