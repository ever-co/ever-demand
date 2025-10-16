import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { IPromotionCreateObject } from '@modules/server.common/interfaces/IPromotion';
import { PromotionService } from '../../../services/products/PromotionService';
import Promotion from '@modules/server.common/entities/Promotion';

@Resolver('Promotion')
export class PromotionResolver {
	constructor(private readonly _promotionService: PromotionService) {}

	@Query('promotions')
	async getPromotions(_context, { findInput }) {
		return this._promotionService.getAllPromotions(findInput);
	}

	@Mutation('createPromotion')
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

	@Mutation('updatePromotion')
	async updatePromotion(
		_,
		{ id, updateInput }: { id; updateInput }
	): Promise<Promotion> {
		await this._promotionService.throwIfNotExists(id);
		return this._promotionService.update(id, updateInput);
	}
}
