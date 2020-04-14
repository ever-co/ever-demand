import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import User from '@modules/server.common/entities/User';
import { createEverLogger } from '../../helpers/Log';
import { first } from 'rxjs/operators';
import { UsersService } from '../../services/users';
import Logger from 'bunyan';

export interface JwtPayload {
	id: string;
}

@Injectable()
export class AuthService {
	public readonly DBObject = User;
	protected readonly log: Logger = createEverLogger({ name: 'authService' });

	constructor(private readonly _usersService: UsersService) {}

	async createToken(id: string) {
		const user: JwtPayload = { id };
		return jwt.sign(user, 'secretKey', { expiresIn: 3600 });
	}

	async validateUser(payload: JwtPayload): Promise<User | null> {
		return this._usersService.get(payload.id).pipe(first()).toPromise();
	}
}
