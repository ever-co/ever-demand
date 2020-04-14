import { ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { first } from 'rxjs/operators';
import { inject, injectable, LazyServiceIdentifer } from 'inversify';
import { routerName } from '@pyro/io';
import { WarehousesService } from '../warehouses';
import { CarriersService } from '../carriers';
import { env } from '../../env';

const jwtSecret = env.JWT_SECRET;

if (jwtSecret === 'default') {
	console.log(
		'Warning: default JWT_SECRET used. Please add your own to config!'
	);
}

export const createJwtData = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: jwtSecret,
};

export interface JwtPayload {
	// id of carrier or warehouse
	id: string;
	// name of app, e.g. 'carrier' or 'warehouse'. TODO: switch to use enum
	appName: string;
}

export function createToken(id: string, appName: string) {
	const user: JwtPayload = { id, appName };
	return jwt.sign(user, 'secretKey', {
		// TODO: add expires timeout to config (.env)
		expiresIn: 3600,
	});
}

@injectable()
@routerName('auth')
export class AuthenticationService {
	constructor(
		@inject(new LazyServiceIdentifer(() => WarehousesService))
		protected warehousesService: WarehousesService,
		@inject(new LazyServiceIdentifer(() => CarriersService))
		protected carriersService: CarriersService
	) {}

	async validateUser(payload: JwtPayload): Promise<any> {
		if (payload.appName === 'carrier') {
			return this.carriersService
				.get(payload.id)
				.pipe(first())
				.toPromise();
		} else if (payload.appName === 'warehouse') {
			return this.warehousesService
				.get(payload.id)
				.pipe(first())
				.toPromise();
		} else {
			return null;
		}
	}
}
