import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';
import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import ProductInfo from '@modules/server.common/entities/ProductInfo';

@Injectable()
export class GeoLocationProductsService {
	constructor(private readonly apollo: Apollo) {}
	geoLocationProductsByPaging(
		geoLocation,
		pagingOptions: IPagingOptions,
		options?: {
			isDeliveryRequired?: boolean;
			isTakeaway?: boolean;
			merchantIds?: string[];
			imageOrientation?: number;
			locale?: string;
			withoutCount?: boolean;
		},
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
								isProductAvailable
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
				// Apollo Client 4 can emit a result without data (loading or
				// an ignored error); the old client only emitted results.
				filter((res) => !!res.data?.geoLocationProductsByPaging),
				map((res) =>
					(
						res.data.geoLocationProductsByPaging as ProductInfo[]
					)
						.filter(Boolean)
						.filter(
							(p) =>
								p.warehouseProduct.isProductAvailable === true
						)
				),
				share()
			);
	}

	async getCountOfGeoLocationProducts(
		geoLocation,
		options?: {
			isDeliveryRequired?: boolean;
			isTakeaway?: boolean;
			merchantIds?: string[];
			imageOrientation?: number;
			locale?: string;
			withoutCount?: boolean;
		},
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

		// Apollo 4 resolves with data undefined when the request fails (e.g. the API is down).
		return res.data?.['getCountOfGeoLocationProducts'] ?? 0;
	}
}
