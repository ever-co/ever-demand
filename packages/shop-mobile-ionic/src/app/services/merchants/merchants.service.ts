import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';

@Injectable()
export class MerchantsService {
	constructor(private readonly _apollo: Apollo) {}

	async getMerchantsBuyName(
		searchName: string,
		geoLocation?: { loc: ILocation }
	) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetMerchantsBuyName(
						$searchName: String!
						$geoLocation: GeoLocationFindInput
					) {
						getMerchantsBuyName(
							searchName: $searchName
							geoLocation: $geoLocation
						) {
							id
							username
							name
							logo
						}
					}
				`,
				variables: { searchName, geoLocation },
			})
			.toPromise();

		return res.data['getMerchantsBuyName'];
	}
}
