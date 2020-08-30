import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import IUser from '@modules/server.common/interfaces/IUser';

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
}
