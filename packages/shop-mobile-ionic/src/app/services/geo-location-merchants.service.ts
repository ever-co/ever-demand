import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';

@Injectable()
export class GeoLocationsMerchantsService {
	constructor(private readonly _apollo: Apollo) {}

	getCoseMerchants(geoLocation: { loc: ILocation }) {
		return this._apollo
			.query({
				query: gql`
					query GetCoseMerchants(
						$geoLocation: GeoLocationFindInput!
					) {
						getCoseMerchants(geoLocation: $geoLocation) {
							id
							username
							name
							logo
						}
					}
				`,
				variables: { geoLocation },
			})
			.pipe(
				map((res) => res.data['getCoseMerchants']),
				share()
			);
	}
}
