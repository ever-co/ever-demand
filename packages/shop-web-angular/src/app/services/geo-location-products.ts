import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import ProductInfo from '@modules/server.common/entities/ProductInfo';

@Injectable()
export class GeoLocationProductsService {
	constructor(private readonly apollo: Apollo) {}
	geoLocationProductsByPaging(
		geoLocation,
		pagingOptions: IPagingOptions,
		options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean },
		searchText?: string
	): Observable<ProductInfo[]> {
		return this.apollo
			.watchQuery<{ geoLocationProductsByPaging: ProductInfo[] }>({
				query: gql`
					query GeoLocationProductsByPaging(
						$geoLocation: GeoLocationFindInput!
						$options: GetGeoLocationProductsOptions
						$pagingOptions: PagingOptionsInput
						$searchText: String
					) {
						geoLocationProductsByPaging(
							geoLocation: $geoLocation
							options: $options
							pagingOptions: $pagingOptions
							searchText: $searchText
						) {
							distance
							warehouseId
							warehouseLogo
							warehouseProduct {
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
					}
				`,
				variables: { geoLocation, options, pagingOptions, searchText },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.geoLocationProductsByPaging),
				share()
			);
	}

	async getCountOfGeoLocationProducts(
		geoLocation,
		options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean },
		searchText?: string
	) {
		const res = await this.apollo
			.query({
				query: gql`
					query GetCountOfGeoLocationProducts(
						$geoLocation: GeoLocationFindInput!
						$options: GetGeoLocationProductsOptions
						$searchText: String
					) {
						getCountOfGeoLocationProducts(
							geoLocation: $geoLocation
							options: $options
							searchText: $searchText
						)
					}
				`,
				variables: { geoLocation, options, searchText },
			})
			.toPromise();

		return res.data['getCountOfGeoLocationProducts'];
	}
}
