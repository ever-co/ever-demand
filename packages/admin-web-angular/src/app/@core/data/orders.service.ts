import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Order from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';

@Injectable()
export class OrdersService {
	constructor(private readonly _apollo: Apollo) {}

	generatePastOrdersPerCarrier() {
		return this._apollo.query({
			query: gql`
				query GeneratePastOrdersPerCarrier {
					generatePastOrdersPerCarrier
				}
			`,
		});
	}

	generateActiveAndAvailableOrdersPerCarrier() {
		return this._apollo.query({
			query: gql`
				query GenerateActiveAndAvailableOrdersPerCarrier {
					generateActiveAndAvailableOrdersPerCarrier
				}
			`,
		});
	}

	addOrdersToTake(): Observable<any> {
		return this._apollo.query({
			query: gql`
				query AddOrdersToTake {
					addOrdersToTake
				}
			`,
		});
	}

	addTakenOrders(carrierIds: string[]): Observable<any> {
		return this._apollo.query({
			query: gql`
				query AddTakenOrders($carrierIds: [String!]!) {
					addTakenOrders(carrierIds: $carrierIds)
				}
			`,
			variables: { carrierIds },
		});
	}

	generateRandomOrdersCurrentStore(
		storeId: string,
		storeCreatedAt: Date,
		ordersLimit: number
	): Observable<{ error: boolean; message: string }> {
		return this._apollo
			.query<{
				generateRandomOrdersCurrentStore: {
					error: boolean;
					message: string;
				};
			}>({
				query: gql`
					query GenerateRandomOrdersCurrentStore(
						$storeId: String!
						$storeCreatedAt: Date!
						$ordersLimit: Int!
					) {
						generateRandomOrdersCurrentStore(
							storeId: $storeId
							storeCreatedAt: $storeCreatedAt
							ordersLimit: $ordersLimit
						) {
							error
							message
						}
					}
				`,
				variables: { storeId, storeCreatedAt, ordersLimit },
			})
			.pipe(map((res) => res.data.generateRandomOrdersCurrentStore));
	}

	getOrdersChartTotalOrders(): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ getOrdersChartTotalOrders: Order[] }>({
				// no needed
				// isCompleted
				query: gql`
					query GetOrdersChartTotalOrders {
						getOrdersChartTotalOrders {
							isCancelled
							_createdAt
							totalPrice
						}
					}
				`,
			})
			.valueChanges.pipe(
				map((res) => res.data.getOrdersChartTotalOrders),
				share()
			);
	}

	async getOrdersChartTotalOrdersNew() {
		const res = await this._apollo
			.query<{
				getOrdersChartTotalOrders: Order[];
			}>({
				query: gql`
					query GetOrdersChartTotalOrders {
						getOrdersChartTotalOrders {
							isCancelled
							_createdAt
							totalPrice
							isCompleted
						}
					}
				`,
			})
			.toPromise();
		return res.data.getOrdersChartTotalOrders;
	}

	getDashboardCompletedOrders(): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ getDashboardCompletedOrders: Order[] }>({
				query: gql`
					query GetDashboardCompletedOrders {
						getDashboardCompletedOrders {
							warehouseId
							totalPrice
						}
					}
				`,
			})
			.valueChanges.pipe(
				map((res) => res.data.getDashboardCompletedOrders),
				share()
			);
	}

	async getComplatedOrdersInfo(storeId?: string) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetComplatedOrdersInfo($storeId: String) {
						getCompletedOrdersInfo(storeId: $storeId) {
							totalOrders
							totalRevenue
						}
					}
				`,
				variables: { storeId },
			})
			.toPromise();

		return res.data['getCompletedOrdersInfo'];
	}

	getDashboardCompletedOrdersToday(): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ getDashboardCompletedOrdersToday: Order[] }>({
				query: gql`
					query GetDashboardCompletedOrdersToday {
						getDashboardCompletedOrdersToday {
							user {
								_id
							}
							warehouseId
							totalPrice
							isCompleted
						}
					}
				`,
			})
			.valueChanges.pipe(
				map((res) => res.data.getDashboardCompletedOrdersToday),
				share()
			);
	}

	getOrders(): Observable<Order[]> {
		return this._apollo
			.watchQuery<{ orders: Order[] }>({
				query: gql`
					query Orders {
						orders {
							user {
								_id
							}
							warehouseId
							totalPrice
							isCompleted
						}
					}
				`,
				pollInterval: 4000,
			})
			.valueChanges.pipe(
				map((res) => res.data.orders),
				share()
			);
	}

	getOrderById(id: string) {
		return this._apollo
			.watchQuery({
				query: gql`
					query GetOrderById($id: String!) {
						getOrder(id: $id) {
							id
							warehouseId
							carrierId
							createdAt
							orderNumber
						}
					}
				`,
				pollInterval: 4000,
				variables: { id },
			})
			.valueChanges.pipe(
				map((res) => res.data['getOrder']),
				share()
			);
	}

	async getUsersOrdersCountInfo(usersIds?: string[]) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetUsersOrdersCountInfo($usersIds: [String!]) {
						getUsersOrdersCountInfo(usersIds: $usersIds) {
							id
							ordersCount
						}
					}
				`,
				variables: { usersIds },
			})
			.toPromise();

		return res.data['getUsersOrdersCountInfo'];
	}

	async getMerchantsOrdersCountInfo(merchantsIds?: string[]) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetMerchantsOrdersCountInfo(
						$merchantsIds: [String!]
					) {
						getMerchantsOrdersCountInfo(
							merchantsIds: $merchantsIds
						) {
							id
							ordersCount
						}
					}
				`,
				variables: { merchantsIds },
			})
			.toPromise();

		return res.data['getMerchantsOrdersCountInfo'];
	}

	async getMerchantsOrders() {
		const res = await this._apollo
			.query({
				query: gql`
					query getMerchantsOrders {
						getMerchantsOrders {
							_id
							ordersCount
						}
					}
				`,
			})
			.toPromise();

		return res.data['getMerchantsOrders'];
	}

	protected _orderFactory(order: Order) {
		return order == null ? null : new Order(order);
	}
}
