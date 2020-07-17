import { Injectable } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import IWarehouse from '@modules/server.common/interfaces/IWarehouse';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';

@Injectable()
export class WarehouseService {
	constructor(private readonly _apollo: Apollo) {}

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

	protected _warehouseFactory(warehouse: IWarehouse) {
		return warehouse == null ? null : new Warehouse(warehouse);
	}
}
