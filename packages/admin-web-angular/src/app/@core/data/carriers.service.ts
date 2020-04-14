import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Carrier from '@modules/server.common/entities/Carrier';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@Injectable()
export class CarriersService {
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

	getCarriers(
		pagingOptions?: IPagingOptions,
		carriersFindInput?: any
	): Observable<Carrier[]> {
		return this._apollo
			.watchQuery<{ getCarriers: ICarrier[] }>({
				query: gql`
					query GetCarriers(
						$pagingOptions: PagingOptionsInput
						$carriersFindInput: CarriersFindInput
					) {
						getCarriers(
							pagingOptions: $pagingOptions
							carriersFindInput: $carriersFindInput
						) {
							_id
							firstName
							lastName
							phone
							logo
							isDeleted
							numberOfDeliveries
							skippedOrderIds
							status
							isActive
							username
							isSharedCarrier
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
				variables: { pagingOptions, carriersFindInput },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.getCarriers),
				map((carriers) => carriers.map((c) => this._carrierFactory(c))),
				share()
			);
	}

	removeByIds(ids: string[]): Observable<any> {
		return this._apollo.mutate({
			mutation: gql`
				mutation RemoveCarriersByIds($ids: [String!]!) {
					removeCarriersByIds(ids: $ids)
				}
			`,
			variables: { ids },
		});
	}

	getCarrierByUsername(username: string): Observable<any> {
		return this._apollo
			.query({
				query: gql`
					query GetCarrierByUsername($username: String!) {
						getCarrierByUsername(username: $username) {
							username
						}
					}
				`,
				variables: { username },
			})
			.pipe(
				map((res) => res.data['getCarrierByUsername']),
				share()
			);
	}

	getCarrierById(id: string): Observable<any> {
		return this._apollo
			.query({
				query: gql`
					query GetCarrierById($id: String!) {
						getCarrier(id: $id) {
							id
							firstName
							logo
						}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data['getCarrier']),
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

	async getCountOfCarriers(carriersFindInput?: any): Promise<any> {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCountOfCarriers(
						$carriersFindInput: CarriersFindInput
					) {
						getCountOfCarriers(
							carriersFindInput: $carriersFindInput
						)
					}
				`,
				variables: { carriersFindInput },
			})
			.toPromise();

		return res.data['getCountOfCarriers'];
	}

	protected _carrierFactory(carrier: ICarrier) {
		return carrier == null ? null : new Carrier(carrier);
	}
}
