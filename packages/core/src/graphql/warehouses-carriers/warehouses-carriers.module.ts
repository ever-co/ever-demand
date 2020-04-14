import { Module } from '@nestjs/common';
import { WarehouseCarriersResolver } from './warehouses-carriers.resolver';

@Module({
	providers: [WarehouseCarriersResolver],
	imports: [],
})
export class WarehousesCarriersModule {}
