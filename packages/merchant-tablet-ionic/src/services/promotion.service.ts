import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { IPromotionCreateObject } from '@modules/server.common/interfaces/IPromotion';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class PromotionService {
	constructor(private readonly apollo: Apollo) {}

	//tstodo
	getAll(): Observable<any> {
		return this.apollo
			.query<any>({
				query: gql`
					query allPromotions {
						promotions {
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
							purchasesCount
						}
					}
				`,
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
					mutation CreatePromotion($promotion: PromotionCreateInput) {
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
