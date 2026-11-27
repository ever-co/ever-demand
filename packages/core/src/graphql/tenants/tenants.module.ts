import { Module } from '@nestjs/common';
import { TenantsResolver } from './tenants.resolver';

@Module({
	providers: [TenantsResolver],
})
export class TenantsModule {}
