import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';

@Module({
	providers: [OrderResolver],
})
export class OrdersModule {}
