import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import Order from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import { Observable } from 'rxjs';

@Injectable()
export class GeoLocationOrdersService {
	constructor(private readonly apollo: Apollo) {}

	getOrdersForWork(
		geoLocation: IGeoLocation,
		skippedOrderIds: string[] = [],
		options: { sort?: string; skip?: number; limit?: number } = {
			sort: 'asc',
		},
		searchObj?: { byRegex: Array<{ key: string; value: string }> }
	): Observable<Order[]> {
		return this.apollo
			.watchQuery<{ getOrdersForWork: Order[] }>({
				query: gql`
					query GetOrdersForWork(
						$geoLocation: GeoLocationFindInput!
						$skippedOrderIds: [String!]!
						$options: GeoLocationOrdersOptions
						$searchObj: SearchOrdersForWork
					) {
						getOrdersForWork(
							geoLocation: $geoLocation
							skippedOrderIds: $skippedOrderIds
							options: $options
							searchObj: $searchObj
						) {
							id
							carrierStatus
							carrierStatusText
							warehouseStatusText
							createdAt
							user {
								id
								firstName
								lastName
								image
								geoLocation {
									streetAddress
									house
									postcode
									countryName
									city
								}
							}
							warehouse {
								id
								name
								logo
								geoLocation {
									house
									postcode
									countryName
									city
								}
							}
						}
					}
				`,
				variables: { geoLocation, skippedOrderIds, options, searchObj },
				pollInterval: 1000,
			})
			.valueChanges.pipe(
				map((res) => res.data.getOrdersForWork),
				share()
			);
	}

	async getCountOfOrdersForWork(
		geoLocation: IGeoLocation,
		skippedOrderIds: string[] = [],
		searchObj?: { byRegex: Array<{ key: string; value: string }> }
	) {
		const res = await this.apollo
			.query({
				query: gql`
					query GetCountOfOrdersForWork(
						$geoLocation: GeoLocationFindInput!
						$skippedOrderIds: [String!]!
						$searchObj: SearchOrdersForWork
					) {
						getCountOfOrdersForWork(
							geoLocation: $geoLocation
							skippedOrderIds: $skippedOrderIds
							searchObj: $searchObj
						)
					}
				`,
				variables: { geoLocation, skippedOrderIds, searchObj },
			})
			.toPromise();

		return res.data['getCountOfOrdersForWork'];
	}
}
