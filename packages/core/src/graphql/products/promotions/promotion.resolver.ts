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

	@Mutation()
	async removePromotion(_, { id }: { id: string }): Promise<void> {
		await this._promotionService.throwIfNotExists(id);
		return this._promotionService.remove(id);
	}

	@Mutation()
	async removePromotionsByIds(_, { ids }: { ids: string[] }): Promise<void> {
		const promotions = await this._promotionService.find({
			_id: { $in: ids },
			isDeleted: { $eq: false },
		});

		const promotionsIds = promotions.map((p) => p.id);

		return this._promotionService.removeMultipleByIds(promotionsIds);
	}
}
