import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';

@Injectable()
export class WarehouseProductsService {
	constructor(private readonly _apollo: Apollo) {}

	getProductsWithPagination(
		id: string,
		pagingOptions?: IPagingOptions
	): Observable<WarehouseProduct[]> {
		return this._apollo
			.watchQuery<{ productsCategories: WarehouseProduct[] }>({
				query: gql`
					query GetProductsWithPagination(
						$id: String!
						$pagingOptions: PagingOptionsInput
					) {
						getProductsWithPagination(
							id: $id
							pagingOptions: $pagingOptions
						) {
							id
							_id
							price
							initialPrice
							count
							soldCount
							product {
								description {
									value
									locale
								}
								_id
								id
								title {
									value
									locale
								}
								details {
									value
									locale
								}
								images {
									locale
									url
									orientation
									width
									height
								}
								categories
								_createdAt
								_updatedAt
							}
							isCarrierRequired
							isTakeaway
							deliveryTimeMin
							deliveryTimeMax
							isCarrierRequired
							isDeliveryRequired
							isManufacturing
							isTakeaway
						}
					}
				`,
				pollInterval: 2000,
				variables: { id, pagingOptions },
			})
			.valueChanges.pipe(
				map((res) => res.data['getProductsWithPagination'])
			);
	}

	async getProductsCount(id: string) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetProductsCount($id: String!) {
						getProductsCount(id: $id)
					}
				`,
				variables: { id },
			})
			.toPromise();

		return res.data['getProductsCount'];
	}
}
