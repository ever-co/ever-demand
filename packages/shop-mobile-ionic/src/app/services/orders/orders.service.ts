import { Injectable } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';

@Injectable()
export class OrdersService {
	constructor(private readonly _apollo: Apollo) {}

	getOrder(id: string, getObject: string) {
		return this._apollo
			.query<{ getOrder: Order }>({
				query: gql`
					query GetOrder($id: String!) {
						getOrder(id: $id) ${getObject}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data.getOrder as Partial<Order>),
				share()
			);
	}

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
