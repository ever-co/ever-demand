import { Injectable } from '../../node_modules/@angular/core';
import { Apollo } from '../../node_modules/apollo-angular';
import gql from 'graphql-tag';
import { map, share } from '../../node_modules/rxjs/operators';
import Carrier from '@modules/server.common/entities/Carrier';

export interface CarrierLoginInfo {
	carrier: Carrier;
	token: string;
}

@Injectable()
export class AuthService {
	constructor(private readonly apollo: Apollo) {}
	login(username: string, password: string) {
		return this.apollo
			.mutate<{ carrierLogin: CarrierLoginInfo }>({
				mutation: gql`
					mutation CarrierLogin(
						$username: String!
						$password: String!
					) {
						carrierLogin(username: $username, password: $password) {
							token
							carrier {
								id
							}
						}
					}
				`,
				variables: {
					username,
					password
				}
			})
			.pipe(
				map((result) => result.data.carrierLogin),
				share()
			);
	}
}
