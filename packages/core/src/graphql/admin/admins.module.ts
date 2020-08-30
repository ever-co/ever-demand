import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';

@Module({
	providers: [AdminResolver],
})
export class AdminsModule {}
