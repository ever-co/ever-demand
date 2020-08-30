import { Module } from '@nestjs/common';
import { DataResolver } from './data.resolver';

@Module({
	providers: [DataResolver],
})
export class DataModule {}
