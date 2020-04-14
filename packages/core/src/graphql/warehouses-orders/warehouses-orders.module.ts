import { Module } from '@nestjs/common';
import { WarehouseOrdersResolver } from './warehouses-orders.resolver';

@Module({
	providers: [WarehouseOrdersResolver],
	imports: [],
})
export class WarehousesOrdersModule {}
