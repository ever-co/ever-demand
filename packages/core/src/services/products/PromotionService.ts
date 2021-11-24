import { injectable } from 'inversify';
import { routerName } from '@pyro/io';
import { DBService } from '@pyro/db-server';
import IService from 'services/IService';
import Promotion from '@modules/server.common/entities/Promotion';
import { createEverLogger } from '../../helpers/Log';
import Logger from 'bunyan';
import { IPromotionCreateObject } from '@modules/server.common/interfaces/IPromotion';
import { first } from 'rxjs/operators';
import _ = require('lodash');

@injectable()
@routerName('promotion')
export class PromotionService extends DBService<Promotion> implements IService {
	public readonly DBObject: any = Promotion;

	protected readonly log: Logger = createEverLogger({
		name: 'productsCategoriesService',
	});

	async createPromotion(promotion: IPromotionCreateObject): Promise<any> {
		let data: any;

		try {
			data = await this.create(promotion);

			return {
				success: true,
				message: `Successfully created promotion ${data.title || ''}`,
				data,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
			};
		}
	}

	async getAllPromotions(findInput: { warehouse: string }): Promise<any[]> {
		const warehousePromotions = await this.Model.find({
			warehouse: { $eq: findInput.warehouse },
			isDeleted: { $eq: false },
		})
			.select({
				title: 1,
				description: 1,
				active: 1,
				promoPrice: 1,
				activeFrom: 1,
				activeTo: 1,
				image: 1,
				product: 1,
				warehouse: 1,
				purchasesCount: 1,
			})
			.lean()
			.exec();

		return _.map(warehousePromotions, (p) => {
			return {
				...p,
				warehouseId: p.warehouse,
				productId: p.product,
			};
		});
	}

	async throwIfNotExists(promotionId: string) {
		const promotion = await this.get(promotionId).pipe(first()).toPromise();

		if (!promotion || promotion.isDeleted) {
			throw Error(`Promotion with id '${promotionId}' does not exist!`);
		}
	}
}
