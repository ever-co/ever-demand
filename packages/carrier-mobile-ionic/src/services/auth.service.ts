import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
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
					password,
				},
			})
			.pipe(
				map((result) => result.data.carrierLogin),
				share()
			);
	}
}
