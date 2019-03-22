import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';

@Injectable()
export class OrdersService {
	constructor(private readonly _apollo: Apollo) {}

	getOrderedUsersInfo(storeId: string) {
		return this._apollo
			.watchQuery({
				query: gql`
					query GetOrderedUsersInfo($storeId: String!) {
						getOrderedUsersInfo(storeId: $storeId) {
							user {
								_id
								id
								image
								firstName
								lastName
								email
								apartment
								phone
								geoLocation {
									countryId
									city
									house
									streetAddress
									loc {
										type
										coordinates
									}
								}
							}
							ordersCount
							totalPrice
						}
					}
				`,
				variables: { storeId },
				pollInterval: 1000
			})
			.valueChanges.pipe(
				map((res) => res.data['getOrderedUsersInfo']),
				share()
			);
	}
}
