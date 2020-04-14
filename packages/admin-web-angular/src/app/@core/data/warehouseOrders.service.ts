import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { IOrderCreateInput } from '@modules/server.common/routers/IWarehouseOrdersRouter';
import Order from '@modules/server.common/entities/Order';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@Injectable()
export class WarehouseOrdersService {
	constructor(private readonly _apollo: Apollo) {}

	createOrder(createInput: IOrderCreateInput): Observable<Order> {
		return this._apollo
			.mutate({
				mutation: gql`
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
				`,
				variables: { createInput },
			})
			.map((result: any) => result.data.createOrder);
	}

	getDashboardOrdersChartOrders(storeId: string): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ getDashboardOrdersChartOrders: Order[] }>({
				query: gql`
					query GetDashboardOrdersChartOrders($storeId: String!) {
						getDashboardOrdersChartOrders(storeId: $storeId) {
							isCompleted
							isCancelled
							_createdAt
							totalPrice
						}
					}
				`,
				variables: { storeId },
			})
			.valueChanges.pipe(
				map((res) => res.data.getDashboardOrdersChartOrders)
			);
	}

	getStoreOrders(storeId: string): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ getStoreOrders: Order[] }>({
				query: gql`
					query GetStoreOrders($storeId: String!) {
						getStoreOrders(storeId: $storeId) {
							id
							isCompleted
							products {
								count
								price
							}
						}
					}
				`,
				pollInterval: 5000,
				variables: { storeId },
			})
			.valueChanges.pipe(map((res) => res.data.getStoreOrders));
	}

	getStoreOrdersTableData(
		storeId: string,
		pagingOptions?: IPagingOptions,
		status?: string
	): Observable<{ orders: Order[] }> {
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
							orders {
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
								user {
									id
									firstName
									lastName
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
									geoLocation {
										house
										postcode
										countryName
										city
									}
								}

								products {
									count
									price
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
					}
				`,
				pollInterval: 5000,
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
}
