import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'secretKey',
		});
	}

	// async validate(payload: JwtPayload, done: Function) {
	//   const user = await this.authService.validateUser(payload);
	//   if (!user) {
	//     return done(new UnauthorizedException(), false);
	//   }
	//   done(null, user);
	// }
}
