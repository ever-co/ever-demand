import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import User from '@modules/server.common/entities/User';
import { map, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import IUser, {
	IResponseGenerate1000Customers,
} from '@modules/server.common/interfaces/IUser';
import { IUserRegistrationInput } from '@modules/server.common/routers/IUserAuthRouter';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

@Injectable()
export class UsersService {
	constructor(private readonly _apollo: Apollo) {}

	isUserEmailExists(email: string): Promise<boolean> {
		return this._apollo
			.query<{ isUserEmailExists: boolean }>({
				query: gql`
					query IsUserEmailExists($email: String!) {
						isUserEmailExists(email: $email)
					}
				`,
				variables: { email },
			})
			.pipe(map((res) => res.data.isUserEmailExists))
			.toPromise();
	}

	isUserExists(conditions: {
		exceptCustomerId: string;
		memberKey: string;
		memberValue: string;
	}): Observable<boolean> {
		return this._apollo
			.query({
				query: gql`
					query IsUserExists($conditions: UserMemberInput!) {
						isUserExists(conditions: $conditions)
					}
				`,
				variables: { conditions },
			})
			.pipe(map((res) => res.data['isUserExists']));
	}

	getUsers(pagingOptions?: IPagingOptions): Observable<User[]> {
		return this._apollo
			.watchQuery<{ users: IUser[] }>({
				query: gql`
					query AllUsers($pagingOptions: PagingOptionsInput) {
						users(pagingOptions: $pagingOptions) {
							_id
							firstName
							lastName
							image
							email
							apartment
							phone
							isBanned
							geoLocation {
								countryId
								city
								house
								streetAddress
								loc {
									type
									coordinates
								}
							}
						}
					}
				`,
				variables: { pagingOptions },
				pollInterval: 5000,
			})
			.valueChanges.pipe(
				map((res) => res.data.users),
				map((users) => users.map((user) => this._userFactory(user))),
				share()
			);
	}

	getUserById(id: string) {
		return this._apollo
			.query({
				query: gql`
					query GetUserById($id: String!) {
						user(id: $id) {
							_id
							firstName
							lastName
							image
							email
							apartment
							phone
							isBanned
							geoLocation {
								streetAddress
								city
								house
								loc {
									type
									coordinates
								}
							}
						}
					}
				`,
				variables: { id },
			})
			.pipe(
				map((res) => res.data['user']),
				map((user) => this._userFactory(user)),
				share()
			);
	}

	removeByIds(ids: string[]) {
		return this._apollo.mutate({
			mutation: gql`
				mutation RemoveUsersByIds($ids: [String!]!) {
					removeUsersByIds(ids: $ids)
				}
			`,
			variables: { ids },
		});
	}

	async registerUser(registerInput: IUserRegistrationInput) {
		const res = await this._apollo
			.mutate({
				mutation: gql`
					mutation RegisterUser($registerInput: UserRegisterInput!) {
						registerUser(registerInput: $registerInput) {
							id
							firstName
							lastName
						}
					}
				`,
				variables: { registerInput },
			})
			.toPromise();

		return res.data['registerUser'];
	}

	async banUser(id: string) {
		return this._apollo
			.mutate({
				mutation: gql`
					mutation BanUser($id: String!) {
						banUser(id: $id) {
							id
							firstName
							lastName
						}
					}
				`,
				variables: { id },
			})
			.toPromise();
	}

	async unbanUser(id: string) {
		return this._apollo
			.mutate({
				mutation: gql`
					mutation UnbanUser($id: String!) {
						unbanUser(id: $id) {
							id
							firstName
							lastName
						}
					}
				`,
				variables: { id },
			})
			.toPromise();
	}

	async getCountOfUsers() {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCountOfUsers {
						getCountOfUsers
					}
				`,
			})
			.toPromise();

		return res.data['getCountOfUsers'];
	}

	async getCustomerMetrics(
		id: string
	): Promise<{
		totalOrders: number;
		canceledOrders: number;
		completedOrdersTotalSum: number;
	}> {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCustomerMetrics($id: String!) {
						getCustomerMetrics(id: $id) {
							totalOrders
							canceledOrders
							completedOrdersTotalSum
						}
					}
				`,
				variables: { id },
			})
			.toPromise();

		return res.data['getCustomerMetrics'];
	}

	// TODO: rename and add parameter Qty of fake Customers to generate
	generate1000Customers(
		defaultLng: number,
		defaultLat: number
	): Observable<IResponseGenerate1000Customers> {
		return this._apollo
			.query<{ generate1000Customers: IResponseGenerate1000Customers }>({
				query: gql`
					query Generate1000Customers(
						$defaultLng: Float!
						$defaultLat: Float!
					) {
						generate1000Customers(
							defaultLng: $defaultLng
							defaultLat: $defaultLat
						) {
							success
							message
						}
					}
				`,
				variables: { defaultLng, defaultLat },
			})
			.pipe(
				map((res) => {
					return res.data.generate1000Customers;
				})
			);
	}

	protected _userFactory(user: IUser) {
		return user == null ? null : new User(user);
	}
}
