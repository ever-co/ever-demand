import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Invite from '@modules/server.common/entities/Invite';
import gql from 'graphql-tag';
import { map, share } from 'rxjs/operators';
import {
	IInviteUpdateObject,
	IInviteCreateObject,
} from '@modules/server.common/interfaces/IInvite';
import { InviteViewModel } from '../../pages/+customers/+invites/invites.component';
import { getCountryName } from '@modules/server.common/entities/GeoLocation';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { countries } from '@modules/server.common/data/abbreviation-to-country';
import IPagingOptions from '@modules/server.common/interfaces/IPagingOptions';

interface RemovedObject {
	n: number;
	ok: number;
}

@Injectable()
export class InvitesService {
	constructor(private readonly apollo: Apollo) {}

	private invites$: Observable<Invite[]> = this.apollo
		.watchQuery<{ invites: Invite[] }>({
			query: gql`
				query allInvites {
					invites {
						id
						code
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
						apartment
					}
				}
			`,
			pollInterval: 2000,
		})
		.valueChanges.pipe(
			map((res) => res.data.invites),
			share()
		);

	getAllInvitesRequests(): Observable<Invite[]> {
		return this.invites$;
	}

	getInvites(pagingOptions?: IPagingOptions): Observable<Invite[]> {
		return this.apollo
			.watchQuery<{ invites: Invite[] }>({
				query: gql`
					query AllInvites($pagingOptions: PagingOptionsInput) {
						invites(pagingOptions: $pagingOptions) {
							id
							code
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
							apartment
						}
					}
				`,
				variables: { pagingOptions },
				pollInterval: 2000,
			})
			.valueChanges.pipe(
				map((res) => res.data.invites),
				share()
			);
	}

	createInvite(createInput: IInviteCreateObject): Observable<Invite> {
		return this.apollo
			.mutate<{ createInput: IInviteCreateObject }>({
				mutation: gql`
					mutation CreateInvite($createInput: InviteCreateInput!) {
						createInvite(createInput: $createInput) {
							id
						}
					}
				`,
				variables: {
					createInput,
				},
			})
			.pipe(
				map((result: any) => result.data.createInvite),
				share()
			);
	}

	removeByIds(ids: string[]): Observable<RemovedObject> {
		return this.apollo
			.mutate({
				mutation: gql`
					mutation RemoveInvitesByIds($ids: [String!]!) {
						removeInvitesByIds(ids: $ids) {
							n
						}
					}
				`,
				variables: { ids },
			})
			.pipe(
				map((result: any) => result.data.removeInvitesByIds),
				share()
			);
	}

	updateInvite(
		id: string,
		updateInput: IInviteUpdateObject
	): Observable<Invite> {
		return this.apollo
			.mutate<{ id: string; updateInput: IInviteUpdateObject }>({
				mutation: gql`
					mutation UpdateInvite(
						$id: String!
						$updateInput: InviteUpdateInput!
					) {
						updateInvite(id: $id, updateInput: $updateInput) {
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
				map((result: any) => result.data.updateInvite),
				share()
			);
	}

	async getCreateInviteObject(data: InviteViewModel) {
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

		const invite: IInviteCreateObject = {
			code: data.invite,
			apartment: data.apartment,
			geoLocation,
		};

		return invite;
	}

	async getCountOfInvites() {
		const res = await this.apollo
			.query({
				query: gql`
					query GetCountOfInvites {
						getCountOfInvites
					}
				`,
			})
			.toPromise();

		return res.data['getCountOfInvites'];
	}

	generate1000InvitesConnectedToInviteRequests(
		defaultLng: number,
		defaultLat: number
	) {
		return this.apollo.query({
			query: gql`
				query Generate1000InvitesConnectedToInviteRequests(
					$defaultLng: Float!
					$defaultLat: Float!
				) {
					generate1000InvitesConnectedToInviteRequests(
						defaultLng: $defaultLng
						defaultLat: $defaultLat
					)
				}
			`,
			variables: { defaultLng, defaultLat },
		});
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
