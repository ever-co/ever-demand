import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import gql from 'graphql-tag';

@Injectable()
export class WarehouseProductsService {
	constructor(private readonly apollo: Apollo) {}

	async getWarehouseProduct(warehouseId, warehouseProductId) {
		console.warn(warehouseId);

		const res = await this.apollo
			.query({
				query: gql`
					query GetWarehouseProduct(
						$warehouseId: String!
						$warehouseProductId: String!
					) {
						getWarehouseProduct(
							warehouseId: $warehouseId
							warehouseProductId: $warehouseProductId
						) {
							id
							price
							initialPrice
							count
							soldCount

							product {
								id
								title {
									locale
									value
								}
								description {
									locale
									value
								}
								details {
									locale
									value
								}
								images {
									locale
									url
									width
									height
									orientation
								}
							}
							isManufacturing
							isCarrierRequired
							isDeliveryRequired
							isTakeaway
							deliveryTimeMin
							deliveryTimeMax
						}
					}
				`,
				variables: { warehouseId, warehouseProductId },
			})
			.toPromise();

		return res.data['getWarehouseProduct'];
	}
}
