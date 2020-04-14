import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import User from '@modules/server.common/entities/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'secretKey',
		});
	}

	async validate(
		payload: JwtPayload,
		done: (ex: any, b: User | boolean) => void
	) {
		const user = await this.authService.validateUser(payload);
		if (!user) {
			return done(new UnauthorizedException(), false);
		}
		done(null, user);
	}
}
