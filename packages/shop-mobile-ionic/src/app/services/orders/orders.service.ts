import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class OrdersService {
	constructor(private readonly _apollo: Apollo) {}

	generateOrdersByCustomerId(numberOfOrders: number, customerId: string) {
		return this._apollo.query({
			query: gql`
				query GenerateOrdersByCustomerId(
					$numberOfOrders: Int!
					$customerId: String!
				) {
					generateOrdersByCustomerId(
						numberOfOrders: $numberOfOrders
						customerId: $customerId
					)
				}
			`,
			variables: { numberOfOrders, customerId },
		});
	}
}
