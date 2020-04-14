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

	async validate(payload: JwtPayload, done: any) {
		const user = await this.authService.validateUser(payload);

		if (!user) {
			return done(new UnauthorizedException(), false);
		}

		done(null, user);
	}
}
