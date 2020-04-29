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

	updateUserAddress(
		id: string,
		otherAddresses: { postal_code: string }
	): Observable<any> {
		console.log('From User Service --->>', otherAddresses);
		return this._apollo.mutate({
			mutation: gql`
				mutation updateUserAddresses(
					$id: String!
					$otherAddresses: UserUpdateAddressInput!
				) {
					updateUserAddresses(
						id: $id
						otherAddresses: $otherAddresses
					)
				}
			`,
			variables: { id, otherAddresses },
		});
	}

	// updateUserAddress(id: string, otherAddress: IUserUpdateObject): Observable<IUser> {
	// 	return this._apollo
	// 		.mutate<{ id: string; otherAddress: IUserUpdateObject }>({
	// 			mutation: gql`
	//                 mutation UpdateUserAddress(
	//                     $id: String!
	//                     $otherAddress: UserUpdateAddressInput!
	//                 ) {
	//                     updateUserAddress(id: $id, otherAddress: $otherAddress)
	//                 }
	//             `,
	// 			variables: {
	// 				id,
	// 				otherAddress,
	// 			},
	// 		})
	// 		.pipe(
	// 			map((result: any) => result.data.updateUser),
	// 			share()
	// 		);
	// }
}
