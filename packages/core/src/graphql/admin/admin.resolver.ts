import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { first } from 'rxjs/operators';
import { AdminsService } from '../../services/admins';
import {
	IAdminRegistrationInput,
	IAdminLoginResponse,
} from '@modules/server.common/routers/IAdminRouter';
import { ExtractJwt } from 'passport-jwt';
import Admin from '@modules/server.common/entities/Admin';
import { env } from '../../env';
import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '../../tenant/tenant-context';

/**
 * An admin edits their own profile; editing another admin of the tenant
 * (name, email = login) is for owners, admins and super-admins.
 */
function assertMayEditAdmin(adminId: string, self = false) {
	const actor = TenantContext.actor();

	if (actor?.id === adminId) {
		return;
	}

	if (!self && (actor?.isSuperAdmin || actor?.tenantRole === 'owner' || actor?.tenantRole === 'admin')) {
		return;
	}

	throw new ForbiddenException('You can only change your own account');
}

@Resolver('Admin')
export class AdminResolver {
	constructor(private readonly _adminsService: AdminsService) {}

	@Query('admin')
	async getAdmin(_, { id }: { id: string }): Promise<Admin> {
		return this._adminsService.get(id).pipe(first()).toPromise();
	}

	@Query('adminByEmail')
	async getByEmail(_, { email }: { email: string }): Promise<Admin> {
		return this._adminsService.getByEmail(email);
	}

	@Mutation()
	async registerAdmin(
		_,
		{ registerInput }: { registerInput: IAdminRegistrationInput }
	): Promise<Admin> {
		return this._adminsService.register(registerInput);
	}

	@Mutation()
	async updateAdmin(
		_,
		{ id, updateInput }: { id: string; updateInput }
	): Promise<Admin> {
		assertMayEditAdmin(id);
		await this._adminsService.throwIfNotExists(id);
		return this._adminsService.update(id, updateInput);
	}

	@Mutation()
	async adminLogin(
		_,
		{ email, password }: { email: string; password: string }
	): Promise<IAdminLoginResponse> {
		return this._adminsService.login(email, password);
	}

	@Query()
	async adminAuthenticated(_, __, context: any): Promise<boolean> {
		return this._adminsService.isAuthenticated(
			ExtractJwt.fromAuthHeaderAsBearerToken()(context.req)
		);
	}

	@Mutation()
	async updateAdminPassword(
		_,
		{
			id,
			password,
		}: { id: Admin['id']; password: { current: string; new: string } }
	): Promise<void> {
		if (!env.ADMIN_PASSWORD_RESET) {
			throw new Error('Admin password cannot be changed');
		}

		assertMayEditAdmin(id, true);

		return this._adminsService.updatePassword(id, password);
	}
}
