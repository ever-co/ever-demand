import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import Warehouse from '@modules/server.common/entities/Warehouse';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface WarehouseLoginInfo {
	warehouse: Warehouse;
	token: string;
}

@Injectable()
export class AuthService {
	constructor(private readonly apollo: Apollo) {}

	login(username: string, password: string): Observable<WarehouseLoginInfo> {
		return this.apollo
			.mutate<{ warehouseLogin: WarehouseLoginInfo }>({
				mutation: gql`
					mutation WarehouseLogin(
						$username: String!
						$password: String!
					) {
						warehouseLogin(
							username: $username
							password: $password
						) {
							token
							warehouse {
								id
							}
						}
					}
				`,
				variables: {
					username,
					password,
				},
			})
			.pipe(
				map((result) => result.data.warehouseLogin),
				share<WarehouseLoginInfo>()
			);
	}
}
