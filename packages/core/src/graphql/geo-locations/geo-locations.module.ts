import { Module } from '@nestjs/common';
import { GeoLocationResolver } from './geo-location.resolver';

@Module({
	providers: [GeoLocationResolver],
})
export class GeoLocationsModule {}
