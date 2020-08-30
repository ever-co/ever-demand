import { Module } from '@nestjs/common';
import { CarriersOrdersResolver } from './carriers-orders.resolver';

@Module({
	providers: [CarriersOrdersResolver],
})
export class CarriersOrdersModule {}
