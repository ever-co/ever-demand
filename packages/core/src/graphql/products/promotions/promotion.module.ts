import { Module } from '@nestjs/common';
import { PromotionResolver } from './promotion.resolver';

@Module({
	providers: [PromotionResolver],
})
export class PromotionModule {}
