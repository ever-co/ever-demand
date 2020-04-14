import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import Admin from '@modules/server.common/entities/Admin';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IAdminUpdateObject } from '@modules/server.common/interfaces/IAdmin';

@Injectable()
export class AdminsService {
	constructor(private readonly _apollo: Apollo) {}

	getAdmin(id: string): Observable<Admin> {
		return this._apollo
			.watchQuery<{ admin: Admin }>({
				query: gql`
					query admin($id: String!) {
						admin(id: $id) {
							id
							name
							email
							pictureUrl
							firstName
							lastName
						}
					}
				`,
				variables: { id },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data['admin']),
				share()
			);
	}

	updatePassword(
		id: string,
		password: { new: string; current: string }
	): Observable<any> {
		return this._apollo.mutate({
			mutation: gql`
				mutation UpdateAdminPassword(
					$id: String!
					$password: AdminPasswordUpdateInput!
				) {
					updateAdminPassword(id: $id, password: $password)
				}
			`,
			variables: { id, password },
		});
	}

	updateById(id: string, updateInput: IAdminUpdateObject): Observable<Admin> {
		return this._apollo
			.mutate<{ id: string; updateInput: IAdminUpdateObject }>({
				mutation: gql`
					mutation UpdateAdmin(
						$id: String!
						$updateInput: AdminUpdateInput!
					) {
						updateAdmin(id: $id, updateInput: $updateInput) {
							id
							name
							email
							pictureUrl
							firstName
							lastName
						}
					}
				`,
				variables: {
					id,
					updateInput,
				},
			})
			.pipe(
				map((result: any) => result.data.updateAdmin),
				share()
			);
	}
}
