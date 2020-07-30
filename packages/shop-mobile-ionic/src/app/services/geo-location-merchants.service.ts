import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import ICategory from '@modules/server.common/interfaces/ICategory';

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

	getCloseMerchantsCategory(
		geoLocation: { loc: ILocation },
		category: string
	) {
		return this._apollo
			.query({
				query: gql`
					query getCloseMerchantsCategory(
						$geoLocation: GeoLocationFindInput!
						$category: String
					) {
						getCloseMerchantsCategory(
							geoLocation: $geoLocation
							category: $category
						) {
							id
							username
							name
							logo
						}
					}
				`,
				variables: { geoLocation, category },
			})
			.pipe(
				map((res) => res.data['getCloseMerchantsCategory']),
				share()
			);
	}
}
