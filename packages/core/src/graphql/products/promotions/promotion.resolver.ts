import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { IPromotionCreateObject } from '@ever-platform/common/src/interfaces/IPromotion';
import { PromotionService } from '../../../services/products/PromotionService';

@Resolver('Promotion')
export class PromotionResolver {
	constructor(private readonly _promotionService: PromotionService) {}

	@Query('promotions')
	async getPromotions() {
		return this._promotionService.getAllPromotions();
	}

	@Mutation()
	async createPromotion(
		_,
		{ createInput }: { createInput: IPromotionCreateObject }
	) {
		return this._promotionService.createPromotion(createInput);
	}
}
