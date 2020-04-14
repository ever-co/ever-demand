import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import IWarehouseProductCreateObject from '@modules/server.common/interfaces/IWarehouseProduct';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@Injectable()
export class WarehousesService {
	constructor(private readonly _apollo: Apollo) {}

	hasExistingStores(): Observable<boolean> {
		return this._apollo
			.query<{ hasExistingStores: boolean }>({
				query: gql`
					query HasExistingStores {
						hasExistingStores
					}
				`,
			})
			.pipe(map((res) => res.data.hasExistingStores));
	}

	getCountExistingCustomers() {
		return this._apollo
			.watchQuery<{
				getCountExistingCustomers: { total; perStore };
			}>({
				query: gql`
					query GetCountExistingCustomers {
						getCountExistingCustomers {
							total
							perStore {
								storeId
								customersCount
							}
						}
					}
				`,
			})
			.valueChanges.pipe(
				map((res) => res.data.getCountExistingCustomers)
			);
	}

	getCountExistingCustomersToday() {
		return this._apollo
			.watchQuery<{
				getCountExistingCustomersToday: { total; perStore };
			}>({
				query: gql`
					query GetCountExistingCustomersToday {
						getCountExistingCustomersToday {
							total
							perStore {
								storeId
								customersCount
							}
						}
					}
				`,
			})
			.valueChanges.pipe(
				map((res) => res.data.getCountExistingCustomersToday)
			);
	}

	getAllStores() {
		return this._apollo
			.query<{ getAllStores: Warehouse[] }>({
				query: gql`
					query GetAllStores {
						getAllStores {
							id
							_createdAt
							geoLocation {
								loc {
									coordinates
								}
							}
						}
					}
				`,
			})
			.pipe(map((res) => res.data.getAllStores));
	}

	getStoreLivePosition() {
		return this._apollo
			.watchQuery<{ getAllStores: Warehouse[] }>({
				query: gql`
					query GetAllStores {
						getAllStores {
							id
							_createdAt
							name
							logo
							geoLocation {
								loc {
									coordinates
								}
								city
								countryId
							}
						}
					}
				`,
				pollInterval: 5000,
			})
			.valueChanges.pipe(map((res) => res.data.getAllStores));
	}

	getStores(pagingOptions?: IPagingOptions): Observable<Warehouse[]> {
		return this._apollo
			.watchQuery<{ warehouses: IWarehouse[] }>({
				query: gql`
					query AllWarehouses($pagingOptions: PagingOptionsInput) {
						warehouses(pagingOptions: $pagingOptions) {
							_id
							_createdAt
							name
							contactEmail
							contactPhone
							logo
							username
							usedCarriersIds
							carriersIds
							geoLocation {
								city
								streetAddress
								house
							}
						}
					}
				`,
				variables: { pagingOptions },
				pollInterval: 5000,
			})
			.valueChanges.pipe(
				map((res) => res.data.warehouses),
				map((ws) => ws.map((w) => this._warehouseFactory(w))),
				share()
			);
	}

	getNearbyStores(geoLocation: GeoLocation): Observable<Warehouse[]> {
		return this._apollo
			.watchQuery<{ nearbyStores: IWarehouse[] }>({
				query: gql`
					query GetNearbyStores($geoLocation: GeoLocationFindInput!) {
						nearbyStores(geoLocation: $geoLocation) {
							_id
							name
							contactEmail
							contactPhone
							logo
							geoLocation {
								city
								streetAddress
								house
							}
						}
					}
				`,
				pollInterval: 5000,
				variables: { geoLocation },
			})
			.valueChanges.pipe(
				map((res) => res.data.nearbyStores),
				map((ws) => ws.map((w) => this._warehouseFactory(w))),
				share()
			);
	}

	removeByIds(ids: string[]) {
		return this._apollo.mutate({
			mutation: gql`
				mutation RemoveByIds($ids: [String!]!) {
					removeWarehousesByIds(ids: $ids)
				}
			`,
			variables: { ids },
		});
	}

	addProducts(
		warehouseId: string,
		products: IWarehouseProductCreateObject[]
	) {
		return this._apollo
			.mutate<{
				warehouseId: string;
				products: IWarehouseProductCreateObject[];
			}>({
				mutation: gql`
					mutation AddProducts(
						$warehouseId: String!
						$products: [WarehouseProductInput!]!
					) {
						addWarehouseProducts(
							warehouseId: $warehouseId
							products: $products
						) {
							product {
								id
							}
						}
					}
				`,
				variables: {
					warehouseId,
					products,
				},
			})
			.pipe(
				map((result: any) => result.data.warehouseAddProducts),
				share()
			);
	}

	removeProductsById(warehouseId: string, productsIds: string[]) {
		return this._apollo.mutate({
			mutation: gql`
				mutation RemoveProductsByIds(
					$warehouseId: String!
					$productsIds: [String!]!
				) {
					removeWarehouseProducts(
						warehouseId: $warehouseId
						productsIds: $productsIds
					)
				}
			`,
			variables: { warehouseId, productsIds },
		});
	}

	getStoreById(id: string) {
		return this._apollo
			.query({
				query: gql`
					query GetStoreById($id: String!) {
						warehouse(id: $id) {
							id
							name
							logo
						}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data['warehouse']),
				share()
			);
	}

	async getCountOfMerchants() {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCountOfMerchants {
						getCountOfMerchants
					}
				`,
			})
			.toPromise();

		return res.data['getCountOfMerchants'];
	}

	protected _warehouseFactory(warehouse: IWarehouse) {
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
