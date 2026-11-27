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
import { assertMayUseAdminEmail } from '../../services/admins/super-admin';

/**
 * An admin edits their own profile. Editing another admin of the tenant
 * (name, email = login) is for owners and admins, and an owner or a
 * super-admin is edited only by an owner or a super-admin.
 */
function assertMayEditAdmin(
	target: { id: string; role?: string; isSuperAdmin?: boolean } | null,
	self = false,
) {
	const actor = TenantContext.actor();

	if (target == null || actor?.id === target.id) {
		return;
	}

	if (self || !actor) {
		throw new ForbiddenException('You can only change your own account');
	}

	if (actor.isSuperAdmin) {
		return;
	}

	const protectedTarget =
		target.role === 'owner' || target.isSuperAdmin === true;

	if (
		actor.tenantRole === 'owner' ||
		(actor.tenantRole === 'admin' && !protectedTarget)
	) {
		return;
	}

	throw new ForbiddenException('You can only change your own account');
}

@Resolver('Admin')
export class AdminResolver {
	constructor(private readonly _adminsService: AdminsService) {}

	// A super-admin switched into another tenant reads and edits their own
	// account in their own tenant (TenantContext.runForOwnAccount).

	@Query('admin')
	async getAdmin(_, { id }: { id: string }): Promise<Admin> {
		return TenantContext.runForOwnAccount(id, () =>
			this._adminsService.get(id).pipe(first()).toPromise(),
		);
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
		return TenantContext.runForOwnAccount(id, async () => {
			assertMayEditAdmin(await this._adminsService.getCurrent(id));
			await this._adminsService.throwIfNotExists(id);

			const input: any = { ...(updateInput ?? {}) };

			if (typeof input.email === 'string') {
				input.email = input.email.trim().toLowerCase();
				assertMayUseAdminEmail(input.email, TenantContext.tenantId());
			}

			return this._adminsService.update(id, input);
		});
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

		return TenantContext.runForOwnAccount(id, async () => {
			assertMayEditAdmin(await this._adminsService.getCurrent(id), true);

			return this._adminsService.updatePassword(id, password);
		});
	}
}
