import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
	AuthenticationService,
	createJwtData,
	JwtPayload,
} from '../services/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthenticationService) {
		super(createJwtData);
	}

	// PassportStrategy hands the result to passport: the user, or the error
	async validate(payload: JwtPayload) {
		const user = await this.authService.validateUser(payload);

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
