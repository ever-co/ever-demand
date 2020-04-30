import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import IUser from '@modules/server.common/interfaces/IUser';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UsersService {
	constructor(private readonly _apollo: Apollo) {}

	getUser(id: string) {
		return this._apollo
			.query<{ user: IUser }>({
				query: gql`
					query GetUser($id: String!) {
						user(id: $id) {
							apartment
							geoLocation {
								countryId
								countryName
								postcode
								city
								streetAddress
							}
						}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data.user),
				share()
			);
	}

	updateUserAddress(id: string, updateObject: any): Observable<any> {
		return this._apollo
			.mutate<{ id: string; updateObject: any }>({
				mutation: gql`
					mutation updateUser(
						$id: String!
						$updateObject: UserUpdateObjectInput!
					) {
						updateUser(id: $id, updateObject: $updateObject) {
							fullAddress
						}
					}
				`,
				variables: {
					id,
					updateObject,
				},
			})
			.pipe(
				map((result: any) => result.data.updateUser),
				share()
			);
	}
}
