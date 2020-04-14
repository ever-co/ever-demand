import { Module } from '@nestjs/common';
import { WarehouseProductsResolver } from './warehouse-products.resolver';

@Module({
	providers: [WarehouseProductsResolver],
	imports: [],
})
export class WarehousesProductsModule {}
