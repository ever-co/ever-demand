import { Module } from '@nestjs/common';
import { DeviceResolver } from './device.resolver';

@Module({
	providers: [DeviceResolver],
})
export class DevicesModule {}
