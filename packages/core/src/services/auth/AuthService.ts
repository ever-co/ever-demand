import { EntityService } from '@pyro/db-server/entity-service';
import { DBCreateObject, DBObject, DBRawObject, PyroObjectId } from '@pyro/db';
import { env } from '../../env';
import { WrongPasswordError } from '@modules/server.common/errors/WrongPasswordError';
import bcrypt from 'bcrypt';
import { injectable, interfaces } from 'inversify';
import { RawObject } from '@pyro/db/db-raw-object';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

interface IAuthableCreateObject extends DBCreateObject {
	hash?: string;
}

interface IAuthableRawObject extends DBRawObject, IAuthableCreateObject {
	_id: PyroObjectId;

	hash?: string;
}

interface IAuthable
	extends DBObject<IAuthableRawObject, IAuthableCreateObject> {
	hash?: string;
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
		const entity = this.parse(
			await this.Model.findOne(findObj).select('+hash').lean().exec()
		);

		if (!entity || !(await bcrypt.compare(password, entity.hash))) {
			return null;
		}

		const token = jwt.sign(
			{ id: entity.id, role: this.role },
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
	 * @param {string} token - the jwt token
	 * @returns {Promise<boolean>}
	 */
	async isAuthenticated(token: string): Promise<boolean> {
		try {
			const { id, role } = jwt.verify(token, env.JWT_SECRET) as {
				id: T['id'];
				role: string;
			};

			const entity = await this.Model.findById(id).lean().exec();

			if (!entity) {
				return false;
			}

			return role === this.role;
		} catch (err) {
			if (err instanceof JsonWebTokenError) {
				return false;
			} else {
				throw err;
			}
		}
	}
}

export type AuthServiceFactory = <T extends IAuthable>(
	config: AuthServiceConfig<T>
) => AuthService<T>;

export const authServiceFactory = (
	context: interfaces.Context
): AuthServiceFactory => {
	return <T extends IAuthable>(config: AuthServiceConfig<T>) => {
		const authService = context.container.get<AuthService<T>>(AuthService);
		authService.setConfig(config);
		return authService;
	};
};
