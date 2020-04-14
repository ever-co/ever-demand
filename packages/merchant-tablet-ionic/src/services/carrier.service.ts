import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Carrier from '@modules/server.common/entities/Carrier';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import ICarrier from '@modules/server.common/interfaces/ICarrier';

@Injectable()
export class CarrierService {
	constructor(private readonly _apollo: Apollo) {}

	private carriers$: Observable<Carrier[]> = this._apollo
		.watchQuery<{ getCarriers: ICarrier[] }>({
			query: gql`
				query getCarriers {
					getCarriers {
						_id
						firstName
						lastName
						phone
						logo
						isDeleted
						numberOfDeliveries
						skippedOrderIds
						status
						geoLocation {
							city
							streetAddress
							house
							loc {
								type
								coordinates
							}
						}
					}
				}
			`,
			pollInterval: 1000,
		})
		.valueChanges.pipe(
			map((res) => res.data.getCarriers),
			map((carriers) => carriers.map((c) => this._carrierFactory(c))),
			share()
		);

	getAllCarriers(): Observable<Carrier[]> {
		return this.carriers$;
	}

	updateCarrier(id: string, updateInput: any) {
		return this._apollo
			.mutate<{ updateCarrier: Carrier }>({
				mutation: gql`
					mutation UpdateCarrier(
						$id: String!
						$updateInput: CarrierUpdateInput!
					) {
						updateCarrier(id: $id, updateInput: $updateInput) {
							id
						}
					}
				`,
				variables: {
					id,
					updateInput,
				},
			})
			.pipe(
				map((result) => result.data.updateCarrier),
				share()
			);
	}

	async getCarrierCurrentOrder(carrierId: string): Promise<any> {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCarrierCurrentOrder($carrierId: String!) {
						getCarrierCurrentOrder(carrierId: $carrierId) {
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
								phone
								email
								apartment
								firstName
								lastName
								image
								geoLocation {
									house
									postcode
									countryName
									city
									streetAddress
									loc {
										coordinates
										type
									}
								}
							}
							warehouse {
								id
								name
								logo
								contactEmail
								contactPhone
								geoLocation {
									house
									postcode
									countryName
									city
									streetAddress
									loc {
										coordinates
										type
									}
								}
							}
						}
					}
				`,
				variables: { carrierId },
			})
			.toPromise();

		return res.data['getCarrierCurrentOrder'];
	}

	protected _carrierFactory(carrier: ICarrier) {
		return carrier == null ? null : new Carrier(carrier);
	}
}
