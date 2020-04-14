import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import Order from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class CarriersOrdersService {
	constructor(private readonly apollo: Apollo) {}

	getCarrierOrdersHistory(
		carrierId: string,
		options: { sort?: string; skip?: number; limit?: number } = {
			sort: 'asc',
		}
	): Observable<Order[]> {
		return this.apollo
			.watchQuery<{ getCarrierOrdersHistory: Order[] }>({
				query: gql`
					query GetCarrierOrdersHistory(
						$carrierId: String!
						$options: GeoLocationOrdersOptions
					) {
						getCarrierOrdersHistory(
							carrierId: $carrierId
							options: $options
						) {
							id
							carrierStatus
							carrierStatusText
							warehouseStatusText
							createdAt
							startDeliveryTime
							status
							deliveryTime
							finishedProcessingTime
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
				variables: { carrierId, options },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.getCarrierOrdersHistory),
				share()
			);
	}

	async getCountOfCarrierOrdersHistory(carrierId: string) {
		const res = await this.apollo
			.query({
				query: gql`
					query GetCountOfCarrierOrdersHistory($carrierId: String!) {
						getCountOfCarrierOrdersHistory(carrierId: $carrierId)
					}
				`,
				variables: { carrierId },
			})
			.toPromise();

		return res.data['getCountOfCarrierOrdersHistory'];
	}
}
