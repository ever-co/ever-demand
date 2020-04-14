import { Module } from '@nestjs/common';
import { CarrierResolver } from './carrier.resolver';

@Module({
	providers: [CarrierResolver],
})
export class CarriersModule {}
