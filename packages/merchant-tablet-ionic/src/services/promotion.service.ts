import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { IPromotionCreateObject } from '@modules/server.common/interfaces/IPromotion';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class PromotionService {
	constructor(private readonly apollo: Apollo) {}

	getAll(findInput: { warehouse: string }): Observable<any> {
		return this.apollo
			.query<any>({
				query: gql`
					query allPromotions($findInput: PromotionsFindInput) {
						promotions(findInput: $findInput) {
							_id
							title {
								locale
								value
							}
							description {
								locale
								value
							}
							active
							activeFrom
							activeTo
							image
							promoPrice
							purchasesCount
							warehouseId
							productId
						}
					}
				`,
				variables: { findInput },
			})
			.pipe(
				map((result) => result.data || []),
				share()
			);
	}

	create(promotion: IPromotionCreateObject) {
		return this.apollo
			.mutate<{ promotion: IPromotionCreateObject }>({
				mutation: gql`
					mutation CreatePromotion($promotion: PromotionInput) {
						createPromotion(createInput: $promotion) {
							_id
						}
					}
				`,
				variables: {
					promotion,
				},
			})
			.pipe(
				map((result) => result.data),
				share()
			);
	}

	update(id: String, promotion: IPromotionCreateObject) {
		return this.apollo
			.mutate<{ promotion: IPromotionCreateObject }>({
				mutation: gql`
					mutation UpdatePromotion(
						$id: String
						$promotion: PromotionInput
					) {
						updatePromotion(id: $id, updateInput: $promotion) {
							_id
						}
					}
				`,
				variables: {
					id,
					promotion,
				},
			})
			.pipe(
				map((result) => result.data),
				share()
			);
	}

	removeByIds(ids: string[]) {
		return this.apollo.mutate({
			mutation: gql`
				mutation RemoveByIds($ids: [String!]!) {
					removePromotionsByIds(ids: $ids) {
						ok
						n
					}
				}
			`,
			variables: { ids },
		});
	}
}
