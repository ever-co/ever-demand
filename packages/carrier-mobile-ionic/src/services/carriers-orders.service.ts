import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ICarrierOrdersRouterGetOptions } from '@modules/server.common/routers/ICarrierOrdersRouter';
import IOrder from '@modules/server.common/interfaces/IOrder';
import Order from '@modules/server.common/entities/Order';
import { map, share } from 'rxjs/operators';

@Injectable()
export class CarriersOrdersService {
	constructor(private readonly _apollo: Apollo) {}

	async getCarrierOrders(
		carrierId: string,
		options: ICarrierOrdersRouterGetOptions
	) {
		const res = await this._apollo
			.query<{ getCarrierOrders: Order[] }>({
				query: gql`
					query GetCarrierOrders(
						$carrierId: String!
						$options: CarrierOrdersOptions!
					) {
						getCarrierOrders(
							carrierId: $carrierId
							options: $options
						) {
							id
							isConfirmed
							isCancelled
							isPaid
							warehouseStatus
							carrierStatus
							orderNumber
							_createdAt
							user {
								_id
								firstName
								lastName
								geoLocation {
									countryId
									postcode
									city
								}
							}
							warehouse {
								logo
								name
								geoLocation {
									countryId
									postcode
									city
								}
							}
							# carrier {
							# 	id
							# }
							products {
								count
								isManufacturing
								isCarrierRequired
								isDeliveryRequired
								initialPrice
								price
								product {
									id
									title {
										locale
										value
									}
									details {
										locale
										value
									}
									description {
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
					carrierId,
					options,
				},
			})
			.toPromise();

		return res.data.getCarrierOrders;
		// .valueChanges.pipe(map((res) => res.data.getCarrierOrders));
	}
}
