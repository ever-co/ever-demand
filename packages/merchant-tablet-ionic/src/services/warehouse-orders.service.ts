import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import Order from '@modules/server.common/entities/Order';
import { map } from 'rxjs/operators';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@Injectable()
export class WarehouseOrdersService {
	private readonly _orderProductsMutation = gql`
		mutation MakeOrder($createInput: OrderCreateInput!) {
			createOrder(createInput: $createInput) {
				_id
				_createdAt
				_updatedAt
				carrierStatus
				isConfirmed
				warehouseId
				warehouseStatus
				user {
					_id
				}
				carrier {
					_id
				}
			}
		}
	`;

	constructor(private readonly _apollo: Apollo) {}

	createOrder(createInput: IOrderCreateInput): Observable<Order> {
		return this._apollo
			.mutate({
				mutation: this._orderProductsMutation,
				variables: { createInput },
			})
			.pipe(map((result: any) => result.data.createOrder));
	}

	getStoreOrdersTableData(
		storeId: string,
		pagingOptions?: IPagingOptions,
		status?: string
	): Observable<Order[]> {
		return this._apollo
			.watchQuery({
				query: gql`
					query GetStoreOrdersTableData(
						$storeId: String!
						$pagingOptions: PagingOptionsInput
						$status: String
					) {
						getStoreOrdersTableData(
							storeId: $storeId
							pagingOptions: $pagingOptions
							status: $status
						) {
							page
							orders {
								_id
								id
								carrierStatus
								carrierStatusText
								warehouseStatusText
								createdAt
								warehouseStatus
								deliveryTime
								status
								isConfirmed
								finishedProcessingTime
								isCancelled
								isPaid
								orderType
								orderNumber
								_createdAt
								warehouseId
								user {
									id
									_id
									firstName
									lastName
									phone
									geoLocation {
										streetAddress
										house
										postcode
										countryName
										city
										loc {
											coordinates
										}
									}
								}
								warehouse {
									id
									_id
									name
									geoLocation {
										house
										postcode
										countryName
										city
										loc {
											coordinates
										}
									}
								}
								carrier {
									id
									logo
									email
									firstName
									lastName
									apartment
									phone
									geoLocation {
										city
										streetAddress
										house
										loc {
											coordinates
										}
									}
								}
								products {
									count
									price
									product {
										id
										_id
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
					}
				`,
				pollInterval: 2000,
				variables: { storeId, pagingOptions, status },
			})
			.valueChanges.pipe(
				map((res) => res.data['getStoreOrdersTableData'])
			);
	}

	async getCountOfStoreOrders(storeId: string, status?: string) {
		const res = await this._apollo
			.query({
				query: gql`
					query getCountOfStoreOrders(
						$storeId: String!
						$status: String!
					) {
						getCountOfStoreOrders(
							storeId: $storeId
							status: $status
						)
					}
				`,
				variables: { storeId, status },
			})
			.toPromise();

		return res.data['getCountOfStoreOrders'];
	}

	async removeUserOrders(storeId: string, userId: string) {
		const res = await this._apollo
			.query({
				query: gql`
					query RemoveUserOrders(
						$storeId: String!
						$userId: String!
					) {
						removeUserOrders(storeId: $storeId, userId: $userId) {
							number
							modified
						}
					}
				`,
				variables: { storeId, userId },
			})
			.toPromise();

		return res.data['removeUserOrders'];
	}

	async getOrdersInDelivery(storeId: string) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetOrdersInDelivery($storeId: String!) {
						getOrdersInDelivery(storeId: $storeId) {
							carrier {
								id
								geoLocation {
									loc {
										coordinates
									}
								}
							}
							user {
								geoLocation {
									loc {
										coordinates
									}
								}
							}
						}
					}
				`,
				variables: { storeId },
			})
			.toPromise();

		return res.data['getOrdersInDelivery'];
	}
}
