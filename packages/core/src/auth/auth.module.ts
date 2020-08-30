import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

@Module({
	imports: [],
	providers: [JwtStrategy],
	exports: [],
})
export class AuthModule {}
