import { EntityService } from '@pyro/db-server/entity-service';
import { DBCreateObject, DBObject, DBRawObject, PyroObjectId } from '@pyro/db';
import { env } from '../../env';
import { WrongPasswordError } from '@modules/server.common/errors/WrongPasswordError';
import bcrypt from 'bcrypt';
import { injectable, ResolutionContext } from 'inversify';
import { RawObject } from '@pyro/db/db-raw-object';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { TenantContext } from '../../tenant/tenant-context';
import { tenantDirectory } from '../../tenant/tenant-directory';

/**
 * Logins whose username / email is unique across all tenants: the tenant
 * comes from the account (DESIGN.md §3.5). Customers ('user') log in inside
 * the tenant of the shop.
 */
const GLOBAL_LOGIN_ROLES: ReadonlySet<string> = new Set([
	'admin',
	'warehouse',
	'carrier',
]);

interface IAuthableCreateObject extends DBCreateObject {
	hash?: string;
}

interface IAuthableRawObject extends DBRawObject, IAuthableCreateObject {
	_id: PyroObjectId;

	hash?: string;

	tenantId?: string;
}

interface IAuthable
	extends DBObject<IAuthableRawObject, IAuthableCreateObject> {
	hash?: string;

	tenantId?: string;
}

interface AuthServiceConfig<T extends IAuthable> {
	role: string;
	Entity: any; // AuthService<T>['DBObject'];
	saltRounds: number;
}

@injectable()
export class AuthService<T extends IAuthable> extends EntityService<T> {
	role: string;
	DBObject: { new (arg: RawObject<T>): T; modelName: string };
	saltRounds: number;

	setConfig(config: AuthServiceConfig<T>) {
		this.role = config.role;
		this.DBObject = config.Entity;
		this.saltRounds = config.saltRounds;
	}

	async getPasswordHash(password: string): Promise<string> {
		return bcrypt.hash(password, this.saltRounds);
	}

	async addPassword(id: T['id'], password: string) {
		const entity = this.parse(
			await this.Model.findById(id).select('+hash').lean().exec()
		);

		if (entity != null && entity.hash != null) {
			throw new Error(
				'Password already exists, please call updatePassword instead.'
			);
		}

		await this._savePassword(id, password);
	}

	async updatePassword(
		id: T['id'],
		password: { current: string; new: string }
	): Promise<void> {
		const entity = this.parse(
			await this.Model.findById(id).select('+hash').lean().exec()
		);

		if (!(await bcrypt.compare(password.current, entity.hash))) {
			throw new WrongPasswordError();
		}

		await this._savePassword(id, password.new);
	}

	async _savePassword(id: T['id'], password: string) {
		const hash = await this.getPasswordHash(password);

		await this.Model.findByIdAndUpdate(id, {
			hash,
		})
			.lean()
			.exec();
	}

	async login(
		findObj: any,
		password: string
	): Promise<{ entity: T; token: string } | null> {
		const isGlobal = GLOBAL_LOGIN_ROLES.has(this.role);
		const requestTenantId = TenantContext.tenantId();

		const find = () =>
			this.Model.findOne(findObj).select('+hash').lean().exec();

		const entity = this.parse(
			isGlobal
				? await TenantContext.runAsSystem(
						`${this.role} login by a username unique across tenants`,
						find
				  )
				: await find()
		);

		if (!entity || !(await bcrypt.compare(password, entity.hash))) {
			return null;
		}

		const tenantId =
			entity.tenantId ?? tenantDirectory.getDefaultTenantId();

		// on a tenant's host (or with its Tenant-Id), only that tenant's logins work
		if (isGlobal && requestTenantId != null && tenantId !== requestTenantId) {
			return null;
		}

		const tenant = tenantId ? await tenantDirectory.byId(tenantId) : null;

		if (!tenant || tenant.status !== 'active') {
			return null;
		}

		const token = jwt.sign(
			{ id: entity.id, role: this.role, tenantId },
			env.JWT_SECRET,
			{}
		); // Never expires

		delete entity.hash;

		return {
			entity,
			token,
		};
	}

	/**
	 * Verifies a login token with env.JWT_SECRET and returns the id it was
	 * issued for. Returns null when the token is missing, invalid or was
	 * issued for another role.
	 *
	 * @param {string} token - the jwt token
	 * @param {string} [role=this.role] - the role the token must carry
	 * @returns {(string | null)}
	 */
	getVerifiedId(token: string, role: string = this.role): string | null {
		if (typeof token !== 'string' || token === '') {
			return null;
		}

		try {
			const payload = jwt.verify(token, env.JWT_SECRET, {
				algorithms: ['HS256'],
			}) as { id?: unknown; role?: unknown } | string;

			if (
				payload == null ||
				typeof payload !== 'object' ||
				payload.role !== role ||
				typeof payload.id !== 'string' ||
				payload.id === ''
			) {
				return null;
			}

			if (!this.isTokenOfCurrentTenant(payload, role)) {
				return null;
			}

			return payload.id;
		} catch (err) {
			if (err instanceof JsonWebTokenError) {
				return null;
			} else {
				throw err;
			}
		}
	}

	/**
	 * Whether a token payload belongs to the tenant the request runs in.
	 * Tokens issued before tenants existed carry no tenantId: they belong to
	 * the default tenant. A super-admin acting in another tenant (Tenant-Id
	 * header) may use their own admin token there.
	 */
	private isTokenOfCurrentTenant(
		payload: { id?: unknown; tenantId?: unknown },
		role: string
	): boolean {
		if (TenantContext.isSystem()) {
			return true;
		}

		const current = TenantContext.tenantId();

		if (current == null) {
			return false;
		}

		const tokenTenantId =
			typeof payload.tenantId === 'string' && payload.tenantId !== ''
				? payload.tenantId
				: tenantDirectory.getDefaultTenantId();

		if (tokenTenantId === current) {
			return true;
		}

		const actor = TenantContext.actor();

		return (
			role === 'admin' &&
			actor?.isSuperAdmin === true &&
			actor.id === payload.id
		);
	}

	/**
	 * @param {string} token - the jwt token
	 * @returns {Promise<boolean>}
	 */
	async isAuthenticated(token: string): Promise<boolean> {
		const id = this.getVerifiedId(token);

		if (id == null) {
			return false;
		}

		// a super-admin switched into another tenant: the account is in their own
		const entity = await TenantContext.runForOwnAccount(id, () =>
			this.Model.findById(id).lean().exec()
		);

		return entity != null;
	}
}

export type AuthServiceFactory = <T extends IAuthable>(
	config: AuthServiceConfig<T>
) => AuthService<T>;

export const authServiceFactory = (
	context: ResolutionContext
): AuthServiceFactory => {
	return <T extends IAuthable>(config: AuthServiceConfig<T>) => {
		const authService = context.get<AuthService<T>>(AuthService);
		authService.setConfig(config);
		return authService;
	};
};
