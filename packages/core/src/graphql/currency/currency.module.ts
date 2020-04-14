import { Module } from '@nestjs/common';
import { CurrencyResolver } from './currency.resolver';

@Module({
	providers: [CurrencyResolver],
})
export class CurrencyModule {}
