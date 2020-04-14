import { Module } from '@nestjs/common';
import { GeoLocationMerchantsResolver } from './geo-location-merchants.resolver';

@Module({
	providers: [GeoLocationMerchantsResolver],
})
export class GeoLocationMerchantsModule {}
