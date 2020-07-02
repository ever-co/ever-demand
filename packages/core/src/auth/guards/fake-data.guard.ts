import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { env } from '../../env';

@Injectable()
export class FakeDataGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		return env.FAKE_DATA_GENERATOR;
	}
}
