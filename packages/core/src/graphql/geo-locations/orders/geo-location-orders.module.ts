import { Module } from '@nestjs/common';
import { GeoLocationOrdersResolver } from './geo-location-orders.resolver';

@Module({
	providers: [GeoLocationOrdersResolver],
})
export class GeoLocationOrdersModule {}
