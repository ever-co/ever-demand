import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import { Apollo } from 'apollo-angular';
import { map, share } from 'rxjs/operators';
import gql from 'graphql-tag';
import {
	IInviteRequestCreateObject,
	IInviteRequestUpdateObject,
} from '@modules/server.common/interfaces/IInviteRequest';
import { getCountryName } from '@modules/server.common/entities/GeoLocation';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { InviteRequestViewModel } from '../../pages/+customers/+invites/+invites-requests/invites-requests.component';
import { countries } from '@modules/server.common/data/abbreviation-to-country';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

interface RemovedObject {
	n: number;
	ok: number;
}

@Injectable()
export class InvitesRequestsService {
	constructor(private readonly _apollo: Apollo) {}

	private invitesRequests$: Observable<InviteRequest[]> = this._apollo
		.watchQuery<{ invitesRequests: InviteRequest[] }>({
			query: gql`
				query allInvitesRequests {
					invitesRequests {
						id
						geoLocation {
							city
							streetAddress
							house
							countryId
							loc {
								coordinates
								type
							}
						}
						isInvited
						invitedDate
						apartment
					}
				}
			`,
			pollInterval: 2000,
		})
		.valueChanges.pipe(
			map((res) => res.data.invitesRequests),
			share()
		);

	getAllInvitesRequests(): Observable<InviteRequest[]> {
		return this.invitesRequests$;
	}

	getInvitesRequests(
		pagingOptions?: IPagingOptions,
		invited?: boolean
	): Observable<InviteRequest[]> {
		return this._apollo
			.watchQuery<{ invitesRequests: InviteRequest[] }>({
				query: gql`
					query AllInvitesRequests(
						$pagingOptions: PagingOptionsInput
						$invited: Boolean
					) {
						invitesRequests(
							pagingOptions: $pagingOptions
							invited: $invited
						) {
							id
							geoLocation {
								city
								streetAddress
								house
								countryId
								loc {
									coordinates
									type
								}
							}
							isInvited
							invitedDate
							apartment
						}
					}
				`,
				variables: { pagingOptions, invited },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.invitesRequests),
				share()
			);
	}

	createInviteRequest(
		createInput: IInviteRequestCreateObject
	): Observable<InviteRequest> {
		return this._apollo
			.mutate<{ createInput: IInviteRequestCreateObject }>({
				mutation: gql`
					mutation CreateInviteRequest(
						$createInput: InviteRequestCreateInput!
					) {
						createInviteRequest(createInput: $createInput) {
							id
						}
					}
				`,
				variables: {
					createInput,
				},
			})
			.pipe(
				map((result: any) => result.data.createInviteRequest),
				share()
			);
	}

	removeByIds(ids: string[]): Observable<RemovedObject> {
		return this._apollo
			.mutate({
				mutation: gql`
					mutation RemoveInvitesRequestsByIds($ids: [String!]!) {
						removeInvitesRequestsByIds(ids: $ids) {
							n
						}
					}
				`,
				variables: { ids },
			})
			.pipe(
				map((result: any) => result.data.removeInvitesRequestsByIds),
				share()
			);
	}

	updateInviteRequest(
		id: string,
		updateInput: IInviteRequestUpdateObject
	): Observable<InviteRequest> {
		return this._apollo
			.mutate<{ id: string; updateInput: IInviteRequestUpdateObject }>({
				mutation: gql`
					mutation UpdateInviteRequest(
						$id: String!
						$updateInput: InviteRequestUpdateInput!
					) {
						updateInviteRequest(
							id: $id
							updateInput: $updateInput
						) {
							id
						}
					}
				`,
				variables: {
					id,
					updateInput,
				},
			})
			.pipe(
				map((result: any) => result.data.updateInviteRequest),
				share()
			);
	}

	async getCreateInviteRequestObject(data: InviteRequestViewModel) {
		const res = await this._tryFindNewAddress(
			data.house,
			data.address,
			data.city,
			Object.values(countries).indexOf(data.country)
		);

		const lat = Number(res['lat']).toFixed(7);
		const lng = Number(res['lng']).toFixed(7);

		const geoLocation: IGeoLocationCreateObject = {
			countryId: Object.values(countries).indexOf(data.country),
			city: data.city,
			streetAddress: data.address,
			house: data.house,
			loc: {
				coordinates: [Number(lng), Number(lat)],
				type: 'Point',
			},
		};

		const inviteRequest: IInviteRequestCreateObject = {
			apartment: data.apartment,
			isManual: true,
			geoLocation,
		};

		return inviteRequest;
	}

	generate1000InviteRequests(defaultLng: number, defaultLat: number): any {
		return this._apollo.query({
			query: gql`
				query Generate1000InviteRequests(
					$defaultLng: Float!
					$defaultLat: Float!
				) {
					generate1000InviteRequests(
						defaultLng: $defaultLng
						defaultLat: $defaultLat
					)
				}
			`,
			variables: { defaultLng, defaultLat },
		});
	}

	async getCountOfInvitesRequests(invited?: boolean) {
		const res = await this._apollo
			.query({
				query: gql`
					query GetCountOfInvitesRequests($invited: Boolean) {
						getCountOfInvitesRequests(invited: $invited)
					}
				`,
				variables: { invited },
			})
			.toPromise();

		return res.data['getCountOfInvitesRequests'];
	}

	private _tryFindNewAddress(
		house: string,
		streetAddress: string,
		city: string,
		countryId: number
	) {
		const countryName = getCountryName(countryId);

		const geocoder = new google.maps.Geocoder();

		return new Promise((resolve, reject) => {
			geocoder.geocode(
				{
					address: `${streetAddress} ${house}, ${city}`,
					componentRestrictions: {
						country: countryName,
					},
				},
				(results, status) => {
					if (status === google.maps.GeocoderStatus.OK) {
						const place: google.maps.GeocoderResult = results[0];

						resolve(place.geometry.location.toJSON());
					} else {
						resolve({ lat: 0, lng: 0 });
					}
				}
			);
		});
	}
}
