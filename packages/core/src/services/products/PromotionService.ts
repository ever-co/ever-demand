import { injectable } from 'inversify';
import { routerName } from '@pyro/io';
import { DBService } from '@pyro/db-server';
import IService from 'services/IService';
import Promotion from '@modules/server.common/entities/Promotion';
import { createEverLogger } from '../../helpers/Log';
import Logger from 'bunyan';
import { IPromotionCreateObject } from '@ever-platform/common/src/interfaces/IPromotion';
import { first } from 'rxjs/operators';

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

	async getAllPromotions(): Promise<any[]> {
		return this.find({
			isDeleted: { $eq: false },
		});
	}

	async throwIfNotExists(promotionId: string) {
		const promotion = await this.get(promotionId).pipe(first()).toPromise();

		if (!promotion || promotion.isDeleted) {
			throw Error(`Prmotion with id '${promotionId}' does not exist!`);
		}
	}
}
