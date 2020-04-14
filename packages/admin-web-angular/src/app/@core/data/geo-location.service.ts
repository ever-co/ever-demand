import { Injectable } from '@angular/core';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { Apollo } from 'apollo-angular';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';

@Injectable()
export class GeoLocationService {
	constructor(private readonly apollo: Apollo) {}

	getGeoLocationProducts(
		geoLocation: GeoLocation
	): Observable<ProductInfo[]> {
		return this.apollo
			.watchQuery<{ geoLocationProducts: ProductInfo[] }>({
				query: gql`
					query geoLocationProducts(
						$geoLocation: GeoLocationFindInput!
					) {
						geoLocationProducts(geoLocation: $geoLocation) {
							distance
							warehouseId
							warehouseLogo
							warehouseProduct {
								price
								initialPrice
								count
								isManufacturing
								isCarrierRequired
								isDeliveryRequired
								deliveryTimeMin
								deliveryTimeMax
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
							}
						}
					}
				`,
				variables: {
					geoLocation: {
						countryId: geoLocation.countryId,
						city: geoLocation.city,
						postcode: geoLocation.postcode,
						streetAddress: geoLocation.streetAddress,
						house: geoLocation.house,
						loc: geoLocation.loc,
					},
				},
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.geoLocationProducts),
				share()
			);
	}
}
