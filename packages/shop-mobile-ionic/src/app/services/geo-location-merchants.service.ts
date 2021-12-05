import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, share } from 'rxjs/operators';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';

@Injectable()
export class GeoLocationsMerchantsService {
	constructor(private readonly _apollo: Apollo) {}

	getCloseMerchants(geoLocation: { loc: ILocation }) {
		return this._apollo
			.query({
				query: gql`
					query getCloseMerchants(
						$geoLocation: GeoLocationFindInput!
					) {
						getCloseMerchants(geoLocation: $geoLocation) {
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
				map((res) => res.data['getCloseMerchants']),
				share()
			);
	}
}
