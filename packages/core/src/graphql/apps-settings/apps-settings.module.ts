import { Module } from '@nestjs/common';
import { AdminResolver } from './apps-settings.resolver';

@Module({
	providers: [AdminResolver],
})
export class AppsSettingsModule {}
