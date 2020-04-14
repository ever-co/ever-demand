import { Module } from '@nestjs/common';
import { WarehouseResolver } from './warehouse.resolver';
import { AuthModule } from '../../auth/auth.module';

@Module({
	providers: [WarehouseResolver],
	imports: [AuthModule],
})
export class WarehousesModule {}
